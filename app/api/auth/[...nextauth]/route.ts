// ---------------------------------------------------------------------------
// NextAuth v5 catch-all route handler
// All NextAuth endpoints (sign-in, sign-out, CSRF, session, etc.) are handled
// through this single file by re-exporting the handlers from auth.ts.
// ---------------------------------------------------------------------------

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
