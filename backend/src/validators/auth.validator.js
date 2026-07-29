import { z } from 'zod';

export const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
});

export const completeRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  role: z.enum(['CLIENT', 'FREELANCER'], { errorMap: () => ({ message: 'Role must be CLIENT or FREELANCER' }) }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
