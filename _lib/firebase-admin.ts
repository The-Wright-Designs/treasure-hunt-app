import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApp();
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

function lazy<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop) {
      if (!instance) instance = factory();
      const value = Reflect.get(instance, prop);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const adminAuth = lazy<Auth>(() => getAuth(getAdminApp()));
export const adminDb = lazy<Firestore>(() => getFirestore(getAdminApp()));
