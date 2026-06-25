// ---------------------------------------------------------------------------
// NextAuth v5 (Auth.js) — Root configuration
//
// Exports:
//   handlers — { GET, POST } for the [...nextauth] route handler
//   auth     — call in Server Components / Route Handlers to get the session
//   signIn   — programmatic sign-in (server-side)
//   signOut  — programmatic sign-out (server-side)
//
// Session structure (JWT strategy):
// ┌─────────────────────────────────────────────────────┐
// │  JWT token (httpOnly cookie, signed with AUTH_SECRET)│
// │  {                                                   │
// │    sub:       string          ← Prisma User.id       │
// │    id:        string          ← same as sub          │
// │    email:     string                                 │
// │    name:      string                                 │
// │    role:      "CLIENT" | "FREELANCER" | "ADMIN"      │
// │    avatarUrl: string | null                          │
// │    iat:       number          ← issued at            │
// │    exp:       number          ← expires at           │
// │    jti:       string          ← unique token id      │
// │  }                                                   │
// │                                                      │
// │  Session object (available via auth() / useSession)  │
// │  {                                                   │
// │    user: { id, email, name, role, avatarUrl, image } │
// │    expires: ISO string                               │
// │  }                                                   │
// └─────────────────────────────────────────────────────┘
// ---------------------------------------------------------------------------

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ── Session ─────────────────────────────────────────────────────────────
  session: {
    strategy: "jwt",
    // 30-day expiry; refresh is handled by NextAuth automatically
    maxAge: 30 * 24 * 60 * 60,
  },

  // ── Custom pages ────────────────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login", // Redirect auth errors to login (error shown via query param)
  },

  // ── Providers ───────────────────────────────────────────────────────────
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * authorize() is called by NextAuth when the user submits credentials.
       * Returns a User object on success, or null to signal failed auth.
       * Throwing CredentialsSignin displays the error on the signIn page.
       */
      async authorize(credentials) {
        // 1. Validate shape with Zod (protects against malformed payloads)
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Look up user in the database
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
            passwordHash: true,
          },
        });

        if (!user) return null;

        // 3. Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // 4. Return the subset that populates the JWT (never return passwordHash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],

  // ── Callbacks ───────────────────────────────────────────────────────────
  callbacks: {
    /**
     * jwt callback — runs whenever a token is created or updated.
     * On first sign-in `user` is populated; on subsequent calls only `token`
     * is available. We copy id/role/avatarUrl into the token here.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        token.avatarUrl = (user.avatarUrl as string | null) ?? null;
      }
      return token;
    },

    /**
     * session callback — shapes the session object returned to the client.
     * We surface id, role, and avatarUrl from the JWT so UI components can
     * read them without hitting the database.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
});
