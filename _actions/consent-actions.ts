"use server";

import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import nodemailer from "nodemailer";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { deleteUserData } from "@/_lib/utils/delete-user-data";
import { LEGAL_VERSION } from "@/_lib/utils/legal-version";
import { parentalConsentEmailTemplate } from "@/_lib/utils/email-templates/parental-consent-email-template";
import { ParentDetails } from "@/_types/consent-types";

const TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;

type ConsentState = { success: boolean; error?: string };

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

async function findRequest(token: string) {
  if (!token) return null;
  const ref = adminDb.collection("consentRequests").doc(hashToken(token));
  const doc = await ref.get();
  if (!doc.exists) return null;
  const { uid, expiresAt } = doc.data() as { uid: string; expiresAt: Timestamp };
  if (expiresAt.toMillis() <= Date.now()) return null;
  const user = await adminDb.collection("users").doc(uid).get();
  if (user.data()?.consent?.status !== "pending") return null;
  return { ref, uid, user: user.data() as { name: string; parent: ParentDetails } };
}

export async function requestParentalConsent(): Promise<ConsentState> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { success: false, error: "Please log in again." };

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userRef = adminDb.collection("users").doc(decoded.uid);
    const user = (await userRef.get()).data();

    if (user?.consent?.status !== "pending" || !user.parent) {
      return { success: false, error: "No consent is needed for this account." };
    }

    const lastSent = user.consent.emailSentAt
      ? new Date(user.consent.emailSentAt).getTime()
      : 0;
    if (Date.now() - lastSent < RESEND_COOLDOWN) {
      return { success: false, error: "Please wait a minute before resending." };
    }

    const existing = await adminDb
      .collection("consentRequests")
      .where("uid", "==", decoded.uid)
      .get();
    await Promise.all(existing.docs.map((doc) => doc.ref.delete()));

    const token = randomBytes(32).toString("base64url");
    await adminDb
      .collection("consentRequests")
      .doc(hashToken(token))
      .set({
        uid: decoded.uid,
        expiresAt: Timestamp.fromMillis(Date.now() + TOKEN_LIFETIME),
      });

    const host = (await headers()).get("host");
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://www.treasure-hunt-app.com"
        : `http://${host}`;

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
      to: user.parent.email,
      subject: `${user.name} needs your consent to join the Treasure Hunt App`,
      html: parentalConsentEmailTemplate({
        parentName: user.parent.name,
        teenName: user.name,
        consentUrl: `${baseUrl}/consent/${token}`,
      }),
    });

    await userRef.update({ "consent.emailSentAt": new Date().toISOString() });

    return { success: true };
  } catch (error) {
    console.error("Failed to send parental consent email:", error);
    return {
      success: false,
      error: "We couldn't send the email. Please try again.",
    };
  }
}

export async function getConsentRequest(token: string) {
  const request = await findRequest(token);
  if (!request) return null;
  return {
    teenName: request.user.name,
    parentName: request.user.parent.name,
    relationship: request.user.parent.relationship,
  };
}

export async function grantParentalConsent(
  _prevState: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const token = formData.get("token")?.toString() ?? "";
  const signedName = formData.get("signedName")?.toString().trim() ?? "";
  const agreed = ["isGuardian", "privacy", "terms", "prize"].every(
    (field) => formData.get(field) === "on",
  );

  if (!agreed) {
    return { success: false, error: "Please tick every box to give consent." };
  }
  if (signedName.length < 2) {
    return { success: false, error: "Please type your full name." };
  }

  try {
    const request = await findRequest(token);
    if (!request) {
      return { success: false, error: "This link has expired or already been used." };
    }

    const headerList = await headers();
    await adminDb
      .collection("users")
      .doc(request.uid)
      .update({
        consent: {
          status: "granted",
          grantedAt: new Date().toISOString(),
          signedName: signedName.slice(0, 100),
          ip: headerList.get("x-forwarded-for")?.split(",")[0].trim() ?? "",
          userAgent: headerList.get("user-agent")?.slice(0, 300) ?? "",
          legalVersion: LEGAL_VERSION,
        },
      });
    await request.ref.delete();

    return { success: true };
  } catch (error) {
    console.error("Failed to record parental consent:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function declineParentalConsent(
  _prevState: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const token = formData.get("token")?.toString() ?? "";

  try {
    const request = await findRequest(token);
    if (!request) {
      return { success: false, error: "This link has expired or already been used." };
    }

    await deleteUserData(request.uid);

    return { success: true };
  } catch (error) {
    console.error("Failed to decline parental consent:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
