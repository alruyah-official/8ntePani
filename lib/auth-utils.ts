// ---------------------------------------------------------------------------
// Server-side auth utilities for use in Server Components and Route Handlers.
//
// These functions call `auth()` which reads the JWT session cookie — they
// CANNOT be used in Client Components (use the useCurrentUser hook instead).
// ---------------------------------------------------------------------------

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Returns the current session's user object, or null if not authenticated.
 *
 * Use in any Server Component:
 *   const user = await getCurrentUser();
 *   if (!user) redirect("/login");
 */
export async function getCurrentUser(): Promise<Session["user"] | null> {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Returns the current user or redirects to /login if unauthenticated.
 * Convenience wrapper that removes the null-check boilerplate on protected
 * pages that the middleware might not cover (e.g., nested server actions).
 *
 * Use in protected Server Components:
 *   const user = await requireAuth();
 */
export async function requireAuth(): Promise<Session["user"]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Returns the current user and redirects to /unauthorized if the user does
 * not have one of the required roles.
 *
 * Use in role-gated Server Components:
 *   const user = await requireRole("FREELANCER");
 */
export async function requireRole(
  ...roles: Role[]
): Promise<Session["user"]> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}
