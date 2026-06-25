"use client";

// ---------------------------------------------------------------------------
// useCurrentUser — Client Component hook
//
// Reads the session from NextAuth's SessionProvider (set up in Providers).
// Returns the typed user object from the session or null when loading/signed out.
//
// Usage:
//   const user = useCurrentUser();
//   if (!user) return <GuestView />;
//   return <p>Hello {user.name} ({user.role})</p>;
// ---------------------------------------------------------------------------

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

type CurrentUser = Session["user"] | null;

export function useCurrentUser(): CurrentUser {
  const { data: session } = useSession();
  return session?.user ?? null;
}

/**
 * Returns the full session status alongside the user.
 * Useful when you need to distinguish between "loading" and "unauthenticated".
 *
 * Usage:
 *   const { user, status } = useCurrentUserWithStatus();
 *   if (status === "loading") return <Spinner />;
 */
export function useCurrentUserWithStatus(): {
  user: CurrentUser;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const { data: session, status } = useSession();
  return { user: session?.user ?? null, status };
}
