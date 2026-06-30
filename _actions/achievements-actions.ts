"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { Hunt, PastHuntView } from "@/_types/past-hunt-types";

export async function getPastHunts(): Promise<PastHuntView[] | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const uid = decoded.uid;

  const snapshot = await adminDb
    .collection("hunts")
    .where("participants", "array-contains", uid)
    .where("ongoing", "==", false)
    .orderBy("deadline", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const hunt = doc.data() as Hunt;
    return {
      deadline: hunt.deadline,
      completed: hunt.completedBy.includes(uid),
      noOfHunters: hunt.participants.length,
      winner: hunt.winner === uid,
    };
  });
}
