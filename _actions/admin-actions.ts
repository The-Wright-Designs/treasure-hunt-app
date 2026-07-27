"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import {
  Hunt,
  QueuedHuntView,
  ActiveHuntAdminView,
} from "@/_types/past-hunt-types";

export async function isAdmin(): Promise<boolean> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return false;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.admin === true;
  } catch {
    return false;
  }
}

export async function getQueuedHunts(): Promise<QueuedHuntView[]> {
  if (!(await isAdmin())) return [];

  const snapshot = await adminDb
    .collection("hunts")
    .where("ongoing", "==", false)
    .orderBy("startsAt", "asc")
    .get();

  return snapshot.docs
    .filter((doc) => !doc.data().closedAt)
    .map((doc) => {
      const hunt = doc.data() as Hunt;
      return {
        id: doc.id,
        startsAt: hunt.startsAt,
        deadline: hunt.deadline,
        prizeAmount: hunt.prizeAmount,
        clueCount: hunt.clues?.length ?? 0,
        mapLatitude: hunt.mapLatitude,
        mapLongitude: hunt.mapLongitude,
        locationNote: hunt.locationNote,
      };
    });
}

export async function getActiveHuntAdmin(): Promise<ActiveHuntAdminView | null> {
  if (!(await isAdmin())) return null;

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
    startsAt: hunt.startsAt,
    deadline: hunt.deadline,
    prizeAmount: hunt.prizeAmount,
    clueCount: hunt.clues?.length ?? 0,
    activeHunters: hunt.participants?.length ?? 0,
    completedCount: hunt.completedBy?.length ?? 0,
    mapLatitude: hunt.mapLatitude,
    mapLongitude: hunt.mapLongitude,
    locationNote: hunt.locationNote,
  };
}

export async function createHunt(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to create hunts." };
  }

  const startsAtInput = formData.get("startsAt")?.toString() ?? "";
  const deadlineInput = formData.get("deadline")?.toString() ?? "";

  if (!startsAtInput || !deadlineInput) {
    return { success: false, error: "Start date and deadline are both required." };
  }

  const startsAt = new Date(startsAtInput);
  const deadline = new Date(deadlineInput);

  if (isNaN(startsAt.getTime()) || isNaN(deadline.getTime())) {
    return { success: false, error: "Start date or deadline is not a valid date." };
  }

  if (deadline <= startsAt) {
    return { success: false, error: "The deadline must be after the start date." };
  }

  const prizeAmount = Number(formData.get("prizeAmount"));
  const mapLatitude = Number(formData.get("mapLatitude"));
  const mapLongitude = Number(formData.get("mapLongitude"));
  const mapZoom = Number(formData.get("mapZoom"));

  if (!Number.isFinite(prizeAmount) || prizeAmount <= 0) {
    return { success: false, error: "Prize amount must be greater than 0." };
  }

  if (!Number.isFinite(mapLatitude) || mapLatitude < -90 || mapLatitude > 90) {
    return { success: false, error: "Latitude must be between -90 and 90." };
  }

  if (!Number.isFinite(mapLongitude) || mapLongitude < -180 || mapLongitude > 180) {
    return { success: false, error: "Longitude must be between -180 and 180." };
  }

  if (!Number.isFinite(mapZoom) || mapZoom < 1 || mapZoom > 22) {
    return { success: false, error: "Zoom must be between 1 and 22." };
  }

  const locationNote = formData.get("locationNote")?.toString().trim() ?? "";

  const clues = formData
    .getAll("clue")
    .map((clue) => clue.toString().trim())
    .filter((clue) => clue.length > 0);

  if (clues.length === 0) {
    return { success: false, error: "Add at least one clue." };
  }

  try {
    await adminDb.collection("hunts").add({
      ongoing: false,
      startsAt: startsAt.toISOString(),
      deadline: deadline.toISOString(),
      clues,
      prizeAmount,
      mapLatitude,
      mapLongitude,
      mapZoom,
      ...(locationNote ? { locationNote } : {}),
      participants: [],
      completedBy: [],
      winner: null,
    });
  } catch (error) {
    console.error("Failed to create hunt:", error);
    return { success: false, error: "Failed to save the hunt. Please try again." };
  }

  revalidatePath("/active-hunt");
  revalidatePath("/admin");

  return { success: true };
}
