// ---------------------------------------------------------------------------
// POST /api/auth/signup — creates a new user account
//
// Flow:
//   1. Validate request body with Zod (signupSchema)
//   2. Check for duplicate email
//   3. Hash password with bcrypt (cost factor 12)
//   4. Insert User row in the database
//   5. Return 201 + the new user id (client auto-signs-in after this)
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password, role } = parsed.data;

    // 2. Duplicate check
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // 3. Hash password (cost 12 — good balance between security and speed)
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as Role,
      },
      select: { id: true, email: true, role: true },
    });

    // 5. Return created user metadata (no sensitive fields)
    return NextResponse.json({ userId: user.id, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
