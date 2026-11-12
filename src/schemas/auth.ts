import { z } from 'zod'

export const AUTH_ROLES = ['Clinic administrator', 'Doctor', 'Nurse', 'Receptionist', 'Billing staff'] as const

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  demoRole: z.enum(AUTH_ROLES),
})
