import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/_lib/firebase-admin";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/achievements",
  "/active-hunt",
  "/announcements",
  "/contact",
  "/profile",
  "/safety-tips",
  "/sponsors",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await adminAuth.verifySessionCookie(session, true);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
