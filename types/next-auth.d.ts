// ---------------------------------------------------------------------------
// NextAuth v5 (Auth.js) — TypeScript type augmentation
// Extends Session, User, and JWT to carry id, role, and avatarUrl so every
// consumer gets full type-safety without casting.
// ---------------------------------------------------------------------------

import type { Role } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      /** Prisma user id (cuid) */
      id: string;
      /** Role assigned at signup — CLIENT | FREELANCER | ADMIN */
      role: Role;
      /** Optional avatar URL stored on the User model */
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** Prisma user id — copied from User.id in the jwt callback */
    id: string;
    role: Role;
    avatarUrl?: string | null;
  }
}
