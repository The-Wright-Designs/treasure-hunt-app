import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/_lib/firebase-admin";

export async function deleteUserData(uid: string) {
  const ongoing = await adminDb
    .collection("hunts")
    .where("ongoing", "==", true)
    .get();
  await Promise.all(
    ongoing.docs.map((doc) =>
      doc.ref.update({
        participants: FieldValue.arrayRemove(uid),
        completedBy: FieldValue.arrayRemove(uid),
      }),
    ),
  );
  const requests = await adminDb
    .collection("consentRequests")
    .where("uid", "==", uid)
    .get();
  await Promise.all(requests.docs.map((doc) => doc.ref.delete()));
  await adminDb.collection("users").doc(uid).delete();
  await adminAuth.deleteUser(uid);
}
