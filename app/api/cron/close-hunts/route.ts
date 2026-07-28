import { adminDb } from "@/_lib/firebase-admin";
import { pickWinner, notifyHuntClosed } from "@/_lib/utils/hunt-notify";
import { Hunt } from "@/_types/past-hunt-types";

export const dynamic = "force-dynamic";

const NOTIFY_LIMIT = 10;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    const ongoing = await adminDb
      .collection("hunts")
      .where("ongoing", "==", true)
      .get();

    const overdue = ongoing.docs.filter(
      (doc) => (doc.data() as Hunt).deadline <= now,
    );

    if (overdue.length) {
      const batch = adminDb.batch();

      overdue.forEach((doc) => {
        const hunt = doc.data() as Hunt;
        batch.update(doc.ref, {
          ongoing: false,
          closedAt: now,
          winner: pickWinner(hunt),
        });
      });

      await batch.commit();
    }

    const closed = await adminDb
      .collection("hunts")
      .where("ongoing", "==", false)
      .get();

    const unnotified = closed.docs.filter((doc) => {
      const hunt = doc.data() as Hunt;
      return !!hunt.closedAt && !hunt.notifiedAt;
    });

    const sweep = unnotified.slice(0, NOTIFY_LIMIT);

    let notified = 0;
    let failed = 0;

    for (const doc of sweep) {
      const sent = await notifyHuntClosed(doc.id, doc.data() as Hunt);
      if (sent) notified++;
      else failed++;
    }

    return Response.json({
      closed: overdue.length,
      notified,
      failed,
      pending: unnotified.length - sweep.length,
    });
  } catch (error) {
    console.error("Failed to close hunts:", error);
    return Response.json({ error: "Failed to close hunts" }, { status: 500 });
  }
}
