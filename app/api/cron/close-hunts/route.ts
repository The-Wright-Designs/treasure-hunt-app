import { adminDb } from "@/_lib/firebase-admin";
import { Hunt } from "@/_types/past-hunt-types";

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
    const snapshot = await adminDb
      .collection("hunts")
      .where("ongoing", "==", true)
      .get();

    if (snapshot.empty) {
      return Response.json({ closed: 0, winners: [] });
    }

    const batch = adminDb.batch();
    const closedAt = new Date().toISOString();
    const winners: { id: string; winner: string | null }[] = [];

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
    });

    await batch.commit();

    return Response.json({ closed: snapshot.size, winners });
  } catch (error) {
    console.error("Failed to close hunts:", error);
    return Response.json({ error: "Failed to close hunts" }, { status: 500 });
  }
}
