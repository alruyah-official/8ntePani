// ---------------------------------------------------------------------------
// Zod v3 validation schemas shared between client forms and server API routes.
// Keeping them in one place prevents drift between the two layers.
// ---------------------------------------------------------------------------

import { z } from "zod";

/** Reusable field definitions */
const emailField = z
  .string()
  .min(1, { message: "Email is required." })
  .email({ message: "Enter a valid email address." });

const passwordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." });

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." }),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "FREELANCER"], {
      required_error: "Please select a role.",
      invalid_type_error: "Select a valid role.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
