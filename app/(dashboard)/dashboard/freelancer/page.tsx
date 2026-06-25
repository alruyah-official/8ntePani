import { requireRole } from "@/lib/auth-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelancer Dashboard",
};

/**
 * /dashboard/freelancer — placeholder page for FREELANCER users.
 * requireRole() ensures only FREELANCERs can view this page;
 * CLIENTs are redirected to /unauthorized.
 */
export default async function FreelancerDashboardPage() {
  const user = await requireRole("FREELANCER");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your gigs and earnings.
        </p>
      </div>

      {/* Placeholder stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Active Gigs", value: "0" },
          { label: "Orders in Progress", value: "0" },
          { label: "Total Earned", value: "$0" },
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
        This is the freelancer dashboard placeholder. Business logic will be
        added in subsequent steps.
      </p>
    </div>
  );
}
