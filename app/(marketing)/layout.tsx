import type { ReactNode } from "react";

/**
 * Marketing layout — wraps all public-facing pages (landing, pricing, about, etc.)
 * Add shared marketing-specific providers or wrappers here as needed.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
