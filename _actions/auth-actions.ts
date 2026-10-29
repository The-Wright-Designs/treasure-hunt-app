"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { verifyRecaptchaToken } from "@/_lib/verify-recaptcha";
import { deleteUserData } from "@/_lib/utils/delete-user-data";
import { ageFromDateOfBirth, isEligibleAge } from "@/_lib/utils/age";
import { LEGAL_VERSION } from "@/_lib/utils/legal-version";
import { ParentDetails, RELATIONSHIPS } from "@/_types/consent-types";
import { verifyEmailTemplate } from "@/_lib/utils/email-templates/verify-email-template";

export async function verifyAuthRecaptcha(token: string) {
  const result = await verifyRecaptchaToken(token);
  if (!result.success) {
    throw new Error(`reCAPTCHA: ${result.error || "verification failed"}`);
  }
}

function registrationFields(
  details: {
    dateOfBirth: string;
    school?: string;
    address?: string;
    parent?: ParentDetails;
  },
  email: string,
) {
  const age = ageFromDateOfBirth(details.dateOfBirth);
  if (!isEligibleAge(age)) throw new Error("auth/invalid-age");

  const school = details.school?.trim().slice(0, 200);
  const address = details.address?.trim().slice(0, 200);
  const needsParent = age < 18;

  let parent: ParentDetails | undefined;
  if (needsParent) {
    parent = {
      name: details.parent?.name.trim().slice(0, 100) ?? "",
      email: details.parent?.email.trim().toLowerCase().slice(0, 200) ?? "",
      phone: details.parent?.phone.trim() ?? "",
      relationship: details.parent?.relationship ?? "",
    };
    if (
      parent.name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email) ||
      parent.email === email.toLowerCase() ||
      !/^(\+27|0)[6-8][0-9]{8}$/.test(parent.phone) ||
      !RELATIONSHIPS.includes(parent.relationship)
    ) {
      throw new Error("auth/invalid-parent");
    }
  }

  return {
    dateOfBirth: details.dateOfBirth,
    ...(school && { school }),
    ...(address && { address }),
    ...(parent && { parent }),
    consent: { status: needsParent ? "pending" : "self" },
    termsAcceptedAt: new Date().toISOString(),
    legalVersion: LEGAL_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export async function createSession(
  idToken: string,
  phone?: string,
  details?: {
    dateOfBirth: string;
    school?: string;
    address?: string;
    parent?: ParentDetails;
  },
) {
  const expiresIn = 60 * 60 * 24 * 7 * 1000;
  const decoded = await adminAuth.verifyIdToken(idToken);
  const userRef = adminDb.collection("users").doc(decoded.uid);
  const existing = (await userRef.get()).data() as
    | { email?: string; consent?: unknown }
    | undefined;
  await userRef.set(
    {
      name: decoded.name ?? "",
      ...(!existing?.email && { email: decoded.email ?? "" }),
      emailVerified: decoded.email_verified === true,
      ...(phone !== undefined && { phone }),
      ...(details &&
        !existing?.consent &&
        registrationFields(details, decoded.email ?? "")),
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

export async function sendVerificationEmail(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { success: false, error: "Please log in again." };

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    if (decoded.email_verified || !decoded.email) return { success: true };

    const userRef = adminDb.collection("users").doc(decoded.uid);
    const user = (await userRef.get()).data();

    const lastSent = user?.verificationSentAt
      ? new Date(user.verificationSentAt).getTime()
      : 0;
    if (Date.now() - lastSent < 60 * 1000) {
      return { success: false, error: "Please wait a minute before resending." };
    }

    const host = (await headers()).get("host");
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://www.treasure-hunt-app.com"
        : `http://${host}`;

    const verifyUrl = await adminAuth.generateEmailVerificationLink(
      decoded.email,
      { url: `${baseUrl}/dashboard` },
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
      requireTLS: true,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER as string,
      to: decoded.email,
      subject: "Verify your email for the Treasure Hunt App",
      html: verifyEmailTemplate({
        name: user?.name ?? decoded.name ?? "",
        verifyUrl,
      }),
    });

    await userRef.set(
      { verificationSentAt: new Date().toISOString() },
      { merge: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      error: "We couldn't send the email. Please try again.",
    };
  }
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
      await deleteUserData(decoded.sub);
    } catch (error) {
      console.error("Account deletion failed:", error);
    }
  }
  cookieStore.delete("session");
  redirect("/login");
}
