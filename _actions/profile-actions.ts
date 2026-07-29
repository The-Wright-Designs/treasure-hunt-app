"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";

export async function getProfile() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const doc = await adminDb.collection("users").doc(decoded.uid).get();

  if (!doc.exists) return { name: decoded.name ?? "", phone: "", email: decoded.email ?? "" };
  return doc.data() as { name: string; phone: string; email: string };
}

export type SaveProfileState =
  | { ok: true; emailChanged: boolean }
  | { ok: false; error: string }
  | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;

export async function saveProfile(
  _prevState: SaveProfileState,
  formData: FormData
): Promise<SaveProfileState> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { ok: false, error: "Your session has expired. Please log in again." };

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(session, true);
  } catch {
    return { ok: false, error: "Your session has expired. Please log in again." };
  }

  const phone = ((formData.get("phone") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim();

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (phone !== "" && !SA_PHONE_REGEX.test(phone)) {
    return { ok: false, error: "Please enter a valid South African phone number." };
  }

  const emailChanged = email !== decoded.email;

  if (emailChanged) {
    try {
      await adminAuth.updateUser(decoded.uid, { email, emailVerified: false });
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "";
      if (code === "auth/email-already-exists") {
        return { ok: false, error: "That email is already in use." };
      }
      if (code === "auth/invalid-email") {
        return { ok: false, error: "Please enter a valid email address." };
      }
      console.error("Auth email update failed:", error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }

  await adminDb
    .collection("users")
    .doc(decoded.uid)
    .set({ phone, email, ...(emailChanged && { emailVerified: false }) }, { merge: true });

  if (emailChanged) (await cookies()).delete("session");

  revalidatePath("/profile");

  return { ok: true, emailChanged };
}
