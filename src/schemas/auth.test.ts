import { describe, expect, it } from 'vitest'
import { loginSchema } from './auth'

const valid = { email: 'nurse@clinic.com', password: 'longenough1', demoRole: 'Nurse' as const }

describe('loginSchema', () => {
  it('accepts valid credentials and trims the email', () => {
    const result = loginSchema.safeParse({ ...valid, email: '  nurse@clinic.com ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('nurse@clinic.com')
  })

  it('requires an email', () => {
    const result = loginSchema.safeParse({ ...valid, email: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Email is required')
  })

  it('rejects malformed emails', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Enter a valid email address')
  })

  it('enforces the minimum password length', () => {
    const result = loginSchema.safeParse({ ...valid, password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters')
  })

  it('rejects unknown roles', () => {
    expect(loginSchema.safeParse({ ...valid, demoRole: 'Superuser' }).success).toBe(false)
  })
})
