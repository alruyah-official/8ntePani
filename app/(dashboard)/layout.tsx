import type { ReactNode } from "react";

/**
 * Dashboard layout — wraps all authenticated application pages.
 * Add session guards, sidebar, or auth providers here as needed.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — replace with a real sidebar component */}
      <aside className="w-64 border-r bg-muted/40 p-4">
        <p className="text-muted-foreground text-sm">Sidebar placeholder</p>
      </aside>

      <main className="flex flex-1 flex-col p-8">{children}</main>
    </div>
  );
}
