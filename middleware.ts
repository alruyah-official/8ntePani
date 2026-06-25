// ---------------------------------------------------------------------------
// Next.js Middleware — Route Protection
//
// This middleware wraps the NextAuth `auth` function to intercept every
// request before it reaches a route handler or page component.
//
// Protected routes: anything under /dashboard (the authenticated zone).
// Public routes: /, /login, /signup, /api/auth/*, static assets.
//
// When an unauthenticated user hits a protected route they are redirected to
// /login with the original URL preserved as `callbackUrl` so they land back
// where they intended after signing in.
// ---------------------------------------------------------------------------

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: ReturnType<typeof auth> extends Promise<infer T> ? T : never }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes that require authentication
  const isProtected = nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and trying to access auth pages, redirect to dashboard
  const isAuthPage =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// ---------------------------------------------------------------------------
// Matcher — which paths the middleware runs on.
// Excludes Next.js internals, static files, and the NextAuth API routes
// (those must NOT be protected or sign-in will loop).
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
