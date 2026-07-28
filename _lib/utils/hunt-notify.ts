import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { sendHuntClosedEmail } from "@/_actions/send-hunt-closed-email";
import { HuntParticipant } from "@/_lib/utils/email-templates/hunt-closed-email-template";
import { Hunt } from "@/_types/past-hunt-types";

export function pickWinner(hunt: Hunt): string | null {
  const completedBy = hunt.completedBy ?? [];

  return (
    hunt.winner ??
    (completedBy.length
      ? completedBy[Math.floor(Math.random() * completedBy.length)]
      : null)
  );
}

export async function resolveParticipants(
  uids: string[],
): Promise<Record<string, HuntParticipant>> {
  if (!uids.length) return {};

  const docs = await adminDb.getAll(
    ...uids.map((uid) => adminDb.collection("users").doc(uid)),
  );

  const resolved: Record<string, HuntParticipant> = {};

  for (let index = 0; index < uids.length; index++) {
    const uid = uids[index];
    const doc = docs[index];

    if (doc.exists) {
      const user = doc.data() as {
        name?: string;
        phone?: string;
        email?: string;
      };

      resolved[uid] = {
        name: user.name || uid,
        phone: user.phone || "",
        email: user.email || "",
      };

      continue;
    }

    try {
      const authUser = await adminAuth.getUser(uid);

      resolved[uid] = {
        name: authUser.displayName || uid,
        phone: "",
        email: authUser.email || "",
      };
    } catch (error) {
      console.error(`Failed to resolve user ${uid}:`, error);
      resolved[uid] = { name: uid, phone: "", email: "" };
    }
  }

  return resolved;
}

export async function notifyHuntClosed(
  huntId: string,
  hunt: Hunt,
): Promise<boolean> {
  try {
    const completedBy = hunt.completedBy ?? [];
    const winner = hunt.winner ?? null;
    const uids = Array.from(
      new Set(winner ? [...completedBy, winner] : completedBy),
    );
    const participants = await resolveParticipants(uids);

    const result = await sendHuntClosedEmail({
      huntId,
      startsAt: hunt.startsAt,
      deadline: hunt.deadline,
      closedAt: hunt.closedAt ?? new Date().toISOString(),
      prizeAmount: hunt.prizeAmount,
      clueCount: hunt.clues?.length ?? 0,
      totalParticipants: hunt.participants?.length ?? 0,
      locationNote: hunt.locationNote,
      mapLatitude: hunt.mapLatitude,
      mapLongitude: hunt.mapLongitude,
      winner: winner ? participants[winner] : null,
      completedBy: completedBy.map((uid) => participants[uid]),
    });

    if (!result.success) return false;

    await adminDb
      .collection("hunts")
      .doc(huntId)
      .update({ notifiedAt: new Date().toISOString() });

    return true;
  } catch (error) {
    console.error(`Failed to notify owner for hunt ${huntId}:`, error);
    return false;
  }
}
