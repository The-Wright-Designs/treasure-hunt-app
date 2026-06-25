"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/_lib/firebase-admin";
import { verifyRecaptchaToken } from "@/_lib/verify-recaptcha";

export async function verifyAuthRecaptcha(token: string) {
  const result = await verifyRecaptchaToken(token);
  if (!result.success) {
    throw new Error(`reCAPTCHA: ${result.error || "verification failed"}`);
  }
}

export async function createSession(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 7 * 1000;
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
  cookieStore.delete("session");
}
