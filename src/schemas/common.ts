import { z } from 'zod'

export const emailSchema = z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address'))
export const nameSchema = (label: string) => z.string().trim().min(2, `${label} is required`).max(80, `${label} is too long`)

export const messageSchema = z.object({
  body: z.string().trim().min(3, 'Write a message of at least 3 characters').max(1000, 'Keep the message under 1000 characters'),
})

export const inviteSchema = z.object({
  name: nameSchema('Full name'),
  email: emailSchema,
})

export const reportNameSchema = z.object({
  name: z.string().trim().min(3, 'Report name must be at least 3 characters').max(60, 'Report name is too long'),
})

export const invoiceSchema = z.object({
  patient: nameSchema('Patient name'),
  service: z.string().trim().min(2, 'Service is required').max(80),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter an amount')
    .refine((v) => !Number.isNaN(Number(v)), 'Enter a valid amount')
    .transform(Number)
    .pipe(z.number().positive('Enter an amount greater than 0').max(1_000_000, 'Amount is too large')),
})

export const locationSchema = z.object({
  name: nameSchema('Location name'),
  address: z.string().trim().min(5, 'Enter a full street address').max(160),
})

export const appointmentSchema = z.object({
  patient: nameSchema('Patient name'),
  provider: z.string().min(1, 'Select a provider'),
  visitType: z.enum(['In-Person', 'Video Visit', 'Phone Call']),
  time: z.string().min(1, 'Choose a time'),
})
export type AppointmentFormValues = z.infer<typeof appointmentSchema>
