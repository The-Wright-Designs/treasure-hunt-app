"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { verifyRecaptchaToken } from "@/_lib/verify-recaptcha";

export async function verifyAuthRecaptcha(token: string) {
  const result = await verifyRecaptchaToken(token);
  if (!result.success) {
    throw new Error(`reCAPTCHA: ${result.error || "verification failed"}`);
  }
}

export async function createSession(idToken: string, phone?: string) {
  const expiresIn = 60 * 60 * 24 * 7 * 1000;
  const decoded = await adminAuth.verifyIdToken(idToken);
  await adminDb.collection("users").doc(decoded.uid).set(
    { name: decoded.name ?? "", email: decoded.email ?? "", phone: phone ?? "" },
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
      await adminAuth.updateUser(decoded.sub, { disabled: true });
    } catch (error) {
      console.error("Account deletion failed:", error);
    }
  }
  cookieStore.delete("session");
  redirect("/login");
}
