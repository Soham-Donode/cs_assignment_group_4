
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect unauthenticated users away from /profile
// and authenticated users away from /login.
export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Protect /profile
  if (pathname.startsWith("/profile") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in → skip login page
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/login"],
};
