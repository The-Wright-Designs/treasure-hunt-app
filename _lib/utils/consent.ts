import { adminDb } from "@/_lib/firebase-admin";
import { ConsentStatus } from "@/_types/consent-types";

export async function getConsentStatus(uid: string): Promise<ConsentStatus | null> {
  const doc = await adminDb.collection("users").doc(uid).get();
  return (doc.data()?.consent?.status as ConsentStatus | undefined) ?? null;
}

export async function hasConsent(uid: string): Promise<boolean> {
  const status = await getConsentStatus(uid);
  return status === "granted" || status === "self";
}
