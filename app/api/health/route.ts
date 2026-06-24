import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Minimal health-check endpoint — confirms the API route handler layer is working.
 */
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
