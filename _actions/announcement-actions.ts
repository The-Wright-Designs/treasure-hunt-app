"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";
import { Announcement, AnnouncementView } from "@/_types/announcement-types";
import { isAdmin } from "@/_actions/admin-actions";

function revalidateAnnouncements() {
  revalidatePath("/admin");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}

export async function getAnnouncements(): Promise<AnnouncementView[]> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return [];

  await adminAuth.verifySessionCookie(session, true);

  const snapshot = await adminDb
    .collection("announcements")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const announcement = doc.data() as Announcement;
    return {
      id: doc.id,
      heading: announcement.heading,
      body: announcement.body,
      createdAt: announcement.createdAt,
    };
  });
}

export async function createAnnouncement(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return {
      success: false,
      error: "You are not authorised to create announcements.",
    };
  }

  const heading = formData.get("heading")?.toString().trim() ?? "";
  if (!heading) {
    return { success: false, error: "Heading is required." };
  }

  const body = formData.get("body")?.toString().trim() ?? "";
  if (!body) {
    return { success: false, error: "Body is required." };
  }

  try {
    await adminDb.collection("announcements").add({
      heading,
      body,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return {
      success: false,
      error: "Failed to save the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();

  return { success: true };
}

export async function updateAnnouncement(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return {
      success: false,
      error: "You are not authorised to edit announcements.",
    };
  }

  const id = formData.get("id")?.toString() ?? "";
  if (!id) {
    return { success: false, error: "Announcement ID is missing." };
  }

  const heading = formData.get("heading")?.toString().trim() ?? "";
  if (!heading) {
    return { success: false, error: "Heading is required." };
  }

  const body = formData.get("body")?.toString().trim() ?? "";
  if (!body) {
    return { success: false, error: "Body is required." };
  }

  const ref = adminDb.collection("announcements").doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return { success: false, error: "That announcement no longer exists." };
  }

  try {
    await ref.update({ heading, body });
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return {
      success: false,
      error: "Failed to save the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();

  return { success: true };
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return {
      success: false,
      error: "You are not authorised to delete announcements.",
    };
  }

  const ref = adminDb.collection("announcements").doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return { success: false, error: "That announcement no longer exists." };
  }

  try {
    await ref.delete();
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return {
      success: false,
      error: "Failed to delete the announcement. Please try again.",
    };
  }

  revalidateAnnouncements();

  return { success: true };
}
