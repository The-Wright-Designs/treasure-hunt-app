"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import {
  Hunt,
  QueuedHuntView,
  ActiveHuntAdminView,
  ClosedHuntAdminView,
} from "@/_types/past-hunt-types";
import { pickWinner, notifyHuntClosed } from "@/_lib/utils/hunt-notify";

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
        clues: hunt.clues ?? [],
        entryCode: hunt.entryCode ?? "",
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
    clues: hunt.clues ?? [],
    entryCode: hunt.entryCode ?? "",
    activeHunters: hunt.participants?.length ?? 0,
    completedCount: hunt.completedBy?.length ?? 0,
    mapLatitude: hunt.mapLatitude,
    mapLongitude: hunt.mapLongitude,
    mapZoom: hunt.mapZoom,
    circleLatitude: hunt.circleLatitude,
    circleLongitude: hunt.circleLongitude,
    circleRadius: hunt.circleRadius,
    locationNote: hunt.locationNote,
    closedAt: hunt.closedAt,
    notifiedAt: hunt.notifiedAt,
  };
}

export async function getClosedHuntsNeedingAttention(): Promise<
  ClosedHuntAdminView[]
> {
  if (!(await isAdmin())) return [];

  const snapshot = await adminDb
    .collection("hunts")
    .where("ongoing", "==", false)
    .get();

  return snapshot.docs
    .filter((doc) => {
      const hunt = doc.data() as Hunt;
      return !!hunt.closedAt && !hunt.notifiedAt;
    })
    .map((doc) => {
      const hunt = doc.data() as Hunt;
      return {
        id: doc.id,
        deadline: hunt.deadline,
        closedAt: hunt.closedAt,
        notifiedAt: hunt.notifiedAt,
        winner: hunt.winner ?? null,
        completedCount: hunt.completedBy?.length ?? 0,
      };
    });
}

export async function resendHuntEmail(
  huntId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to do this." };
  }

  const doc = await adminDb.collection("hunts").doc(huntId).get();

  if (!doc.exists) {
    return { success: false, error: "That hunt no longer exists." };
  }

  const sent = await notifyHuntClosed(huntId, doc.data() as Hunt);

  if (!sent) {
    return { success: false, error: "The email failed to send. Try again." };
  }

  revalidatePath("/admin");

  return { success: true };
}

export async function closeHuntNow(
  huntId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to do this." };
  }

  const ref = adminDb.collection("hunts").doc(huntId);
  const doc = await ref.get();

  if (!doc.exists) {
    return { success: false, error: "That hunt no longer exists." };
  }

  const hunt = doc.data() as Hunt;
  const closedAt = new Date().toISOString();
  const winner = pickWinner(hunt);

  await ref.update({ ongoing: false, closedAt, winner });

  const sent = await notifyHuntClosed(huntId, { ...hunt, closedAt, winner });

  revalidatePath("/admin");
  revalidatePath("/active-hunt");

  if (!sent) {
    return {
      success: false,
      error: "The hunt was closed but the email failed. Resend it below.",
    };
  }

  return { success: true };
}

export async function updateHuntClues(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to do this." };
  }

  const huntId = formData.get("huntId")?.toString() ?? "";

  if (!huntId) {
    return { success: false, error: "We couldn't find that hunt." };
  }

  const clues = formData
    .getAll("clue")
    .map((clue) => clue.toString().trim())
    .filter((clue) => clue.length > 0);

  if (clues.length === 0) {
    return { success: false, error: "Add at least one clue." };
  }

  const ref = adminDb.collection("hunts").doc(huntId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      return { success: false, error: "That hunt no longer exists." };
    }

    await ref.update({ clues });
  } catch (error) {
    console.error("Failed to update clues:", error);
    return { success: false, error: "Failed to save the clues. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/active-hunt");

  return { success: true };
}

interface ParsedHunt {
  startsAt: Date;
  deadline: Date;
  prizeAmount: number;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
  circleLatitude?: number;
  circleLongitude?: number;
  circleRadius?: number;
  locationNote: string;
  clues: string[];
  entryCode: string;
}

type ParseResult =
  | { valid: true; hunt: ParsedHunt }
  | { valid: false; error: string };

function parseHuntForm(formData: FormData): ParseResult {
  const startsAtInput = formData.get("startsAt")?.toString() ?? "";

  if (!startsAtInput) {
    return { valid: false, error: "Start date is required." };
  }

  const startsAt = new Date(`${startsAtInput}T07:00:00+02:00`);

  if (isNaN(startsAt.getTime())) {
    return { valid: false, error: "Start date is not a valid date." };
  }

  if (getSastDay(startsAtInput) !== 1) {
    return { valid: false, error: "The start date must be a Monday." };
  }

  if (startsAt.getTime() <= Date.now()) {
    return { valid: false, error: "The start date must be in the future." };
  }

  const deadline = new Date(`${addDays(startsAtInput, 6)}T17:00:00+02:00`);

  const prizeAmount = 500;
  const mapLatitude = Number(formData.get("mapLatitude"));
  const mapLongitude = Number(formData.get("mapLongitude"));
  const mapZoom = Number(formData.get("mapZoom"));

  if (!Number.isFinite(mapLatitude) || mapLatitude < -90 || mapLatitude > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90." };
  }

  if (!Number.isFinite(mapLongitude) || mapLongitude < -180 || mapLongitude > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180." };
  }

  if (![15, 15.5, 16].includes(mapZoom)) {
    return { valid: false, error: "Please choose a valid map zoom." };
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
      valid: false,
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
      valid: false,
      error: "Circle longitude must be between -180 and 180.",
    };
  }

  if (
    circleRadius !== undefined &&
    (!Number.isFinite(circleRadius) || circleRadius < 1 || circleRadius > 5000)
  ) {
    return {
      valid: false,
      error: "Circle radius must be between 1 and 5000 metres.",
    };
  }

  const locationNote = formData.get("locationNote")?.toString().trim() ?? "";

  const clues = formData
    .getAll("clue")
    .map((clue) => clue.toString().trim())
    .filter((clue) => clue.length > 0);

  if (clues.length === 0) {
    return { valid: false, error: "Add at least one clue." };
  }

  const entryCode =
    formData.get("entryCode")?.toString().trim().toUpperCase() ?? "";

  if (entryCode.length < 4) {
    return {
      valid: false,
      error: "Entry code must be at least 4 characters.",
    };
  }

  return {
    valid: true,
    hunt: {
      startsAt,
      deadline,
      prizeAmount,
      mapLatitude,
      mapLongitude,
      mapZoom,
      circleLatitude,
      circleLongitude,
      circleRadius,
      locationNote,
      clues,
      entryCode,
    },
  };
}

export async function createHunt(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to create hunts." };
  }

  const parsed = parseHuntForm(formData);

  if (!parsed.valid) {
    return { success: false, error: parsed.error };
  }

  const hunt = parsed.hunt;

  try {
    await adminDb.collection("hunts").add({
      ongoing: false,
      startsAt: hunt.startsAt.toISOString(),
      deadline: hunt.deadline.toISOString(),
      clues: hunt.clues,
      entryCode: hunt.entryCode,
      prizeAmount: hunt.prizeAmount,
      mapLatitude: hunt.mapLatitude,
      mapLongitude: hunt.mapLongitude,
      mapZoom: hunt.mapZoom,
      ...(hunt.circleLatitude !== undefined
        ? { circleLatitude: hunt.circleLatitude }
        : {}),
      ...(hunt.circleLongitude !== undefined
        ? { circleLongitude: hunt.circleLongitude }
        : {}),
      ...(hunt.circleRadius !== undefined
        ? { circleRadius: hunt.circleRadius }
        : {}),
      ...(hunt.locationNote ? { locationNote: hunt.locationNote } : {}),
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

export async function updateHunt(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "You are not authorised to edit hunts." };
  }

  const huntId = formData.get("huntId")?.toString() ?? "";

  if (!huntId) {
    return { success: false, error: "We couldn't find that hunt." };
  }

  const parsed = parseHuntForm(formData);

  if (!parsed.valid) {
    return { success: false, error: parsed.error };
  }

  const hunt = parsed.hunt;

  const ref = adminDb.collection("hunts").doc(huntId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      return { success: false, error: "That hunt no longer exists." };
    }

    const existing = doc.data() as Hunt;

    if (existing.ongoing || existing.closedAt) {
      return {
        success: false,
        error: "Only hunts that haven't started yet can be edited.",
      };
    }

    await ref.update({
      startsAt: hunt.startsAt.toISOString(),
      deadline: hunt.deadline.toISOString(),
      clues: hunt.clues,
      entryCode: hunt.entryCode,
      prizeAmount: hunt.prizeAmount,
      mapLatitude: hunt.mapLatitude,
      mapLongitude: hunt.mapLongitude,
      mapZoom: hunt.mapZoom,
      circleLatitude: hunt.circleLatitude ?? FieldValue.delete(),
      circleLongitude: hunt.circleLongitude ?? FieldValue.delete(),
      circleRadius: hunt.circleRadius ?? FieldValue.delete(),
      locationNote: hunt.locationNote || FieldValue.delete(),
    });
  } catch (error) {
    console.error("Failed to update hunt:", error);
    return { success: false, error: "Failed to save the hunt. Please try again." };
  }

  revalidatePath("/active-hunt");
  revalidatePath("/admin");

  return { success: true };
}
