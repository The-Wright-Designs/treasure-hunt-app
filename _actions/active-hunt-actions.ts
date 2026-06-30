"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { Hunt, ActiveHuntView } from "@/_types/past-hunt-types";

export async function getActiveHunt(): Promise<ActiveHuntView | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  await adminAuth.verifySessionCookie(session, true);

  const snapshot = await adminDb
    .collection("hunts")
    .where("ongoing", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const hunt = snapshot.docs[0].data() as Hunt;

  return {
    deadline: hunt.deadline,
    prizeAmount: hunt.prizeAmount,
    activeHunters: hunt.participants.length,
    mapLatitude: hunt.mapLatitude,
    mapLongitude: hunt.mapLongitude,
    mapZoom: hunt.mapZoom,
  };
}
