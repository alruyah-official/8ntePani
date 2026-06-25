// ---------------------------------------------------------------------------
// Next.js 16 Proxy (formerly "middleware") — Route Protection
//
// Runs at the Edge before every request. Checks the NextAuth JWT session
// cookie and enforces access rules:
//
//   /dashboard/*  →  requires authentication; unauthenticated → /login
//   /login        →  redirects already-authenticated users → /dashboard
//   /signup       →  redirects already-authenticated users → /dashboard
//   everything else → allowed through
//
// NextAuth v5's `auth()` function accepts a NextAuthMiddleware callback where
// `req.auth` is the Session | null value decoded from the JWT cookie.
// ---------------------------------------------------------------------------

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  // req.auth is the Session object (null when unauthenticated)
  const isLoggedIn = !!req.auth;

  // ── Protected zone ────────────────────────────────────────────────────────
  const isProtected = nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth pages (already logged in) ───────────────────────────────────────
  const isAuthPage =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// ---------------------------------------------------------------------------
// Matcher — which paths the proxy runs on.
// Excludes the NextAuth API routes (must NOT be intercepted or sign-in loops),
// static files, and Next.js internals.
// ---------------------------------------------------------------------------
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
