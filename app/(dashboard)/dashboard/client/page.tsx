import { requireRole } from "@/lib/auth-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Dashboard",
};

/**
 * /dashboard/client — placeholder page for CLIENT users.
 * requireRole() ensures only CLIENTs (and ADMINs) can view this page;
 * FREELANCERs are redirected to /unauthorized.
 */
export default async function ClientDashboardPage() {
  const user = await requireRole("CLIENT", "ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your projects and orders.
        </p>
      </div>

      {/* Placeholder stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Active Orders", value: "0" },
          { label: "Completed", value: "0" },
          { label: "In Review", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        This is the client dashboard placeholder. Business logic will be added
        in subsequent steps.
      </p>
    </div>
  );
}
