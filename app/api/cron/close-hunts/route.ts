import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { sendHuntClosedEmail } from "@/_actions/send-hunt-closed-email";
import { HuntParticipant } from "@/_lib/utils/email-templates/hunt-closed-email-template";
import { Hunt } from "@/_types/past-hunt-types";

export const dynamic = "force-dynamic";

async function resolveParticipants(
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

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("hunts")
      .where("ongoing", "==", true)
      .get();

    if (snapshot.empty) {
      return Response.json({ closed: 0, emailed: 0, winners: [] });
    }

    const batch = adminDb.batch();
    const closedAt = new Date().toISOString();
    const winners: { id: string; winner: string | null }[] = [];
    const closedHunts: { id: string; hunt: Hunt; winner: string | null }[] = [];

    snapshot.docs.forEach((doc) => {
      const hunt = doc.data() as Hunt;
      const completedBy = hunt.completedBy ?? [];

      const winner =
        hunt.winner ??
        (completedBy.length
          ? completedBy[Math.floor(Math.random() * completedBy.length)]
          : null);

      batch.update(doc.ref, { ongoing: false, closedAt, winner });
      winners.push({ id: doc.id, winner });
      closedHunts.push({ id: doc.id, hunt, winner });
    });

    await batch.commit();

    let emailed = 0;

    for (const { id, hunt, winner } of closedHunts) {
      try {
        const completedBy = hunt.completedBy ?? [];
        const uids = Array.from(
          new Set(winner ? [...completedBy, winner] : completedBy),
        );
        const participants = await resolveParticipants(uids);

        const result = await sendHuntClosedEmail({
          huntId: id,
          startsAt: hunt.startsAt,
          deadline: hunt.deadline,
          closedAt,
          prizeAmount: hunt.prizeAmount,
          clueCount: hunt.clues?.length ?? 0,
          totalParticipants: hunt.participants?.length ?? 0,
          locationNote: hunt.locationNote,
          mapLatitude: hunt.mapLatitude,
          mapLongitude: hunt.mapLongitude,
          winner: winner ? participants[winner] : null,
          completedBy: completedBy.map((uid) => participants[uid]),
        });

        if (result.success) emailed++;
      } catch (error) {
        console.error(`Failed to notify owner for hunt ${id}:`, error);
      }
    }

    return Response.json({ closed: snapshot.size, emailed, winners });
  } catch (error) {
    console.error("Failed to close hunts:", error);
    return Response.json({ error: "Failed to close hunts" }, { status: 500 });
  }
}
