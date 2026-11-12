import { ApiError } from '@/services/api/apiClient'
import { fromMock } from '@/services/api/mockTransport'
import type { AuthUser, LoginRequest, Session } from '@/types'

/**
 * DEMO authentication adapter.
 *
 * No backend contract exists yet, so this adapter performs NO real authentication: it accepts any
 * well-formed email and a password of at least 8 characters, and issues a random opaque token.
 * Replace `login` / `logout` / `restore` with apiClient calls when the real auth API is defined.
 * Never ship this adapter to production.
 */
export const AUTH_IS_DEMO = true

const SESSION_HOURS = 8
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const titleCase = (s: string): string =>
  s
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(' ')

export const authService = {
  async login(req: LoginRequest): Promise<Session> {
    await fromMock(null, 600)
    if (!EMAIL.test(req.email) || req.password.length < 8) {
      throw new ApiError({ message: 'Invalid email or password', status: 401 })
    }
    const user: AuthUser = {
      id: `demo-${req.email.toLowerCase()}`,
      name: titleCase(req.email.split('@')[0] ?? 'User') || 'Demo user',
      email: req.email.toLowerCase(),
      role: req.demoRole ?? 'Clinic administrator',
    }
    return {
      user,
      accessToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + SESSION_HOURS * 3_600_000).toISOString(),
    }
  },

  async logout(): Promise<void> {
    await fromMock(undefined, 120)
  },
}
