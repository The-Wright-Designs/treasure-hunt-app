export const getFirestoreConsoleUrl = (huntId: string) => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/data/~2Fhunts~2F${huntId}`;
};
