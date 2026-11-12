import type { Session } from '@/types'

const SESSION_KEY = 'mednevo.session'

/**
 * Session persistence.
 *
 * The access token is kept in memory and mirrored to sessionStorage so a page refresh keeps the user
 * signed in, while closing the tab ends the session. sessionStorage is readable by any script on the
 * page, so a production backend should prefer short-lived tokens plus an httpOnly, SameSite refresh cookie.
 * Frontend checks never replace backend authorization.
 */
let memory: Session | null = null

const isExpired = (s: Session): boolean => Date.parse(s.expiresAt) <= Date.now()

const isSession = (v: unknown): v is Session => {
  if (typeof v !== 'object' || v === null) return false
  const s = v as Partial<Session>
  return typeof s.accessToken === 'string' && typeof s.expiresAt === 'string' && typeof s.user?.id === 'string'
}

export const tokenStorage = {
  getSession(): Session | null {
    if (memory) return isExpired(memory) ? (this.clear(), null) : memory
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const parsed: unknown = JSON.parse(raw)
      if (isSession(parsed) && !isExpired(parsed)) {
        memory = parsed
        return parsed
      }
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* unavailable or corrupt storage */
    }
    return null
  },
  setSession(session: Session): void {
    memory = session
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      /* storage unavailable: session stays in memory only */
    }
  },
  get(): string | null {
    return this.getSession()?.accessToken ?? null
  },
  clear(): void {
    memory = null
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}
