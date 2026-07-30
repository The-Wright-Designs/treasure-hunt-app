"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { Hunt, ActiveHuntView } from "@/_types/past-hunt-types";

async function getUid(): Promise<string | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function getActiveHunt(): Promise<ActiveHuntView | null> {
  const uid = await getUid();
  if (!uid) return null;

  const snapshot = await adminDb
    .collection("hunts")
    .where("ongoing", "==", true)
    .orderBy("startsAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const hunt = doc.data() as Hunt;

  return {
    id: doc.id,
    deadline: hunt.deadline,
    prizeAmount: hunt.prizeAmount,
    activeHunters: hunt.participants?.length ?? 0,
    joined: hunt.participants?.includes(uid) ?? false,
    entered: hunt.completedBy?.includes(uid) ?? false,
    clues: hunt.clues ?? [],
    mapLatitude: hunt.mapLatitude,
    mapLongitude: hunt.mapLongitude,
    mapZoom: hunt.mapZoom,
    circleLatitude: hunt.circleLatitude,
    circleLongitude: hunt.circleLongitude,
    circleRadius: hunt.circleRadius,
  };
}

export async function joinHunt(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const uid = await getUid();

  if (!uid) {
    return {
      success: false,
      error: "Your session has expired. Please log in again.",
    };
  }

  const huntId = formData.get("huntId")?.toString() ?? "";

  if (!huntId) {
    return { success: false, error: "We couldn't find that hunt." };
  }

  const ref = adminDb.collection("hunts").doc(huntId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      return { success: false, error: "We couldn't find that hunt." };
    }

    const hunt = doc.data() as Hunt;

    if (!hunt.ongoing) {
      return { success: false, error: "This hunt is no longer open." };
    }

    if (new Date(hunt.deadline).getTime() <= Date.now()) {
      return {
        success: false,
        error: "This hunt has closed, so late entries aren't accepted.",
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await ref.update({ participants: FieldValue.arrayUnion(uid) });
  } catch (error) {
    console.error("Failed to join hunt:", error);
    return {
      success: false,
      error: "Something went wrong joining the hunt. Please try again.",
    };
  }

  revalidatePath("/active-hunt");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function submitHuntEntry(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const uid = await getUid();

  if (!uid) {
    return {
      success: false,
      error: "Your session has expired. Please log in again.",
    };
  }

  const huntId = formData.get("huntId")?.toString() ?? "";
  const entryCode =
    formData.get("entryCode")?.toString().trim().toUpperCase() ?? "";

  if (!huntId || !entryCode) {
    return { success: false, error: "Please enter the code you found." };
  }

  const ref = adminDb.collection("hunts").doc(huntId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      return { success: false, error: "We couldn't find that hunt." };
    }

    const hunt = doc.data() as Hunt;

    if (!hunt.ongoing) {
      return { success: false, error: "This hunt is no longer open." };
    }

    if (new Date(hunt.deadline).getTime() <= Date.now()) {
      return {
        success: false,
        error: "This hunt has closed, so late entries aren't accepted.",
      };
    }

    if (hunt.completedBy?.includes(uid)) {
      return { success: false, error: "You've already entered this hunt." };
    }

    if (!hunt.participants?.includes(uid)) {
      return {
        success: false,
        error: "Please join the hunt before entering a code.",
      };
    }

    if (!hunt.entryCode || entryCode !== hunt.entryCode) {
      return {
        success: false,
        error: "That code isn't right. Make sure you've found the right item.",
      };
    }

    await ref.update({ completedBy: FieldValue.arrayUnion(uid) });
  } catch (error) {
    console.error("Failed to submit hunt entry:", error);
    return {
      success: false,
      error: "Something went wrong saving your entry. Please try again.",
    };
  }

  revalidatePath("/active-hunt");
  revalidatePath("/achievements");
  revalidatePath("/dashboard");

  return { success: true };
}
