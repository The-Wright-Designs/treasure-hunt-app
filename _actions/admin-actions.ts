"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import {
  Hunt,
  QueuedHuntView,
  ActiveHuntAdminView,
} from "@/_types/past-hunt-types";

function getSastDay(value: string): number {
  const [year, month, date] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay();
}

function addDays(value: string, days: number): string {
  const [year, month, date] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + days))
    .toISOString()
    .slice(0, 10);
}

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
        mapZoom: hunt.mapZoom,
        circleLatitude: hunt.circleLatitude,
        circleLongitude: hunt.circleLongitude,
        circleRadius: hunt.circleRadius,
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
    mapZoom: hunt.mapZoom,
    circleLatitude: hunt.circleLatitude,
    circleLongitude: hunt.circleLongitude,
    circleRadius: hunt.circleRadius,
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

  if (!startsAtInput) {
    return { success: false, error: "Start date is required." };
  }

  const startsAt = new Date(`${startsAtInput}T07:00:00+02:00`);

  if (isNaN(startsAt.getTime())) {
    return { success: false, error: "Start date is not a valid date." };
  }

  if (getSastDay(startsAtInput) !== 1) {
    return { success: false, error: "The start date must be a Monday." };
  }

  if (startsAt.getTime() <= Date.now()) {
    return { success: false, error: "The start date must be in the future." };
  }

  const deadline = new Date(`${addDays(startsAtInput, 6)}T17:00:00+02:00`);

  const prizeAmount = 500;
  const mapLatitude = Number(formData.get("mapLatitude"));
  const mapLongitude = Number(formData.get("mapLongitude"));
  const mapZoom = Number(formData.get("mapZoom"));

  if (!Number.isFinite(mapLatitude) || mapLatitude < -90 || mapLatitude > 90) {
    return { success: false, error: "Latitude must be between -90 and 90." };
  }

  if (!Number.isFinite(mapLongitude) || mapLongitude < -180 || mapLongitude > 180) {
    return { success: false, error: "Longitude must be between -180 and 180." };
  }

  if (![15, 15.5, 16].includes(mapZoom)) {
    return { success: false, error: "Please choose a valid map zoom." };
  }

  const circleLatitudeInput =
    formData.get("circleLatitude")?.toString().trim() ?? "";
  const circleLongitudeInput =
    formData.get("circleLongitude")?.toString().trim() ?? "";
  const circleRadiusInput =
    formData.get("circleRadius")?.toString().trim() ?? "";

  const circleLatitude = circleLatitudeInput
    ? Number(circleLatitudeInput)
    : undefined;
  const circleLongitude = circleLongitudeInput
    ? Number(circleLongitudeInput)
    : undefined;
  const circleRadius = circleRadiusInput ? Number(circleRadiusInput) : undefined;

  if (
    circleLatitude !== undefined &&
    (!Number.isFinite(circleLatitude) ||
      circleLatitude < -90 ||
      circleLatitude > 90)
  ) {
    return {
      success: false,
      error: "Circle latitude must be between -90 and 90.",
    };
  }

  if (
    circleLongitude !== undefined &&
    (!Number.isFinite(circleLongitude) ||
      circleLongitude < -180 ||
      circleLongitude > 180)
  ) {
    return {
      success: false,
      error: "Circle longitude must be between -180 and 180.",
    };
  }

  if (
    circleRadius !== undefined &&
    (!Number.isFinite(circleRadius) || circleRadius < 1 || circleRadius > 5000)
  ) {
    return {
      success: false,
      error: "Circle radius must be between 1 and 5000 metres.",
    };
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
      ...(circleLatitude !== undefined ? { circleLatitude } : {}),
      ...(circleLongitude !== undefined ? { circleLongitude } : {}),
      ...(circleRadius !== undefined ? { circleRadius } : {}),
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
