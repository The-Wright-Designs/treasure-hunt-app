"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { distanceInMeters } from "@/_lib/utils/geo-distance";
import { Hunt, ActiveHuntView } from "@/_types/past-hunt-types";

const LOCATION_ACCURACY_BUFFER = 200;
const DEFAULT_CIRCLE_RADIUS = 200;

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

async function getDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("deviceId")?.value;
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  cookieStore.set("deviceId", deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return deviceId;
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

  const latitudeInput = formData.get("latitude")?.toString().trim() ?? "";
  const longitudeInput = formData.get("longitude")?.toString().trim() ?? "";
  const latitude = latitudeInput === "" ? NaN : Number(latitudeInput);
  const longitude = longitudeInput === "" ? NaN : Number(longitudeInput);
  const deviceId = await getDeviceId();

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

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return {
        success: false,
        error:
          "We couldn't confirm your location. Please allow location access and try again.",
      };
    }

    const centreLatitude = hunt.circleLatitude ?? hunt.mapLatitude;
    const centreLongitude = hunt.circleLongitude ?? hunt.mapLongitude;
    const allowedRadius =
      (hunt.circleRadius ?? DEFAULT_CIRCLE_RADIUS) + LOCATION_ACCURACY_BUFFER;

    const distance = distanceInMeters(
      latitude,
      longitude,
      centreLatitude,
      centreLongitude,
    );

    if (distance > allowedRadius) {
      return {
        success: false,
        error: "You need to be at the hunt location to enter the code.",
      };
    }

    if (hunt.completedDevices?.includes(deviceId)) {
      return {
        success: false,
        error: "This device has already been used to complete this hunt.",
      };
    }

    if (!hunt.entryCode || entryCode !== hunt.entryCode) {
      return {
        success: false,
        error: "That code isn't right. Make sure you've found the right item.",
      };
    }

    await ref.update({
      completedBy: FieldValue.arrayUnion(uid),
      completedDevices: FieldValue.arrayUnion(deviceId),
    });
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
