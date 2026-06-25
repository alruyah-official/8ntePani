"use client";

// ---------------------------------------------------------------------------
// Providers — wraps the app in all client-side providers.
// SessionProvider is required for useSession() / useCurrentUser() to work
// in Client Components. The root layout (a Server Component) renders this.
// ---------------------------------------------------------------------------

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
