import { adminDb } from "@/_lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const active = await adminDb
      .collection("hunts")
      .where("ongoing", "==", true)
      .limit(1)
      .get();

    if (!active.empty) {
      return Response.json({ opened: 0, reason: "a hunt is already active" });
    }

    const snapshot = await adminDb
      .collection("hunts")
      .where("ongoing", "==", false)
      .where("startsAt", "<=", new Date().toISOString())
      .orderBy("startsAt", "asc")
      .get();

    const due = snapshot.docs.filter((doc) => !doc.data().closedAt);

    if (!due.length) {
      return Response.json({ opened: 0, queued: 0 });
    }

    const next = due[0];

    await next.ref.update({ ongoing: true });

    return Response.json({ opened: 1, id: next.id, queued: due.length - 1 });
  } catch (error) {
    console.error("Failed to open hunts:", error);
    return Response.json({ error: "Failed to open hunts" }, { status: 500 });
  }
}
