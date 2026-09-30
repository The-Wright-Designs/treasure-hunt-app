"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { verifyRecaptchaToken } from "@/_lib/verify-recaptcha";

export async function verifyAuthRecaptcha(token: string) {
  const result = await verifyRecaptchaToken(token);
  if (!result.success) {
    throw new Error(`reCAPTCHA: ${result.error || "verification failed"}`);
  }
}

export async function createSession(
  idToken: string,
  phone?: string,
  details?: { age?: string; school?: string; address?: string },
) {
  const age = Number(details?.age);
  const school = details?.school?.trim().slice(0, 200);
  const address = details?.address?.trim().slice(0, 200);
  const expiresIn = 60 * 60 * 24 * 7 * 1000;
  const decoded = await adminAuth.verifyIdToken(idToken);
  const userRef = adminDb.collection("users").doc(decoded.uid);
  const existing = (await userRef.get()).data() as { email?: string } | undefined;
  await userRef.set(
    {
      name: decoded.name ?? "",
      ...(!existing?.email && { email: decoded.email ?? "" }),
      emailVerified: decoded.email_verified === true,
      ...(phone !== undefined && { phone }),
      ...(Number.isInteger(age) && age > 0 && age < 120 && { age }),
      ...(school && { school }),
      ...(address && { address }),
    },
    { merge: true }
  );
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  const cookieStore = await cookies();
  cookieStore.set("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: expiresIn / 1000,
    path: "/",
    sameSite: "lax",
  });
}

export async function requireVerifiedSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) throw new Error("auth/no-session");

  const decoded = await adminAuth.verifySessionCookie(session, true);
  if (decoded.email_verified !== true) {
    throw new Error("auth/email-not-verified");
  }

  return decoded;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch (error) {
      console.error("Token revocation on logout failed:", error);
    }
  }
  cookieStore.delete("session");
}

export async function deleteAccount() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session);
      const ongoing = await adminDb
        .collection("hunts")
        .where("ongoing", "==", true)
        .get();
      await Promise.all(
        ongoing.docs.map((doc) =>
          doc.ref.update({
            participants: FieldValue.arrayRemove(decoded.sub),
            completedBy: FieldValue.arrayRemove(decoded.sub),
          }),
        ),
      );
      await adminDb.collection("users").doc(decoded.sub).delete();
      await adminAuth.deleteUser(decoded.sub);
    } catch (error) {
      console.error("Account deletion failed:", error);
    }
  }
  cookieStore.delete("session");
  redirect("/login");
}
