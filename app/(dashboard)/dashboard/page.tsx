// ---------------------------------------------------------------------------
// /dashboard — Role-aware dispatcher
//
// The middleware guarantees only authenticated users reach this page.
// We read the session role and immediately redirect to the appropriate
// sub-dashboard. This pattern keeps login/signup redirects simple
// (always go to /dashboard) while still providing role-split UX.
// ---------------------------------------------------------------------------

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardDispatchPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "FREELANCER") {
    redirect("/dashboard/freelancer");
  }

  // CLIENT and ADMIN both land on the client dashboard for now
  redirect("/dashboard/client");
}

