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

export async function saveProfile(formData: FormData): Promise<void> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return;

  const decoded = await adminAuth.verifySessionCookie(session, true);

  await adminDb.collection("users").doc(decoded.uid).set(
    {
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
    },
    { merge: true }
  );

  revalidatePath("/profile");
}
