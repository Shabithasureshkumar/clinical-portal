import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '@/services/api/apiClient'
import { tokenStorage } from '@/services/api/tokenStorage'
import { authService } from '@/services/auth/authService'
import type { AuthRole, AuthUser, LoginRequest } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (req: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (roles: readonly AuthRole[] | undefined) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Session state for the whole app. Role checks here are UX only; the backend must enforce authorization. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getSession()?.user ?? null)

  const logout = useCallback(async () => {
    tokenStorage.clear()
    setUser(null)
    try {
      await authService.logout()
    } catch {
      /* the local session is already cleared */
    }
  }, [])

  const login = useCallback(async (req: LoginRequest) => {
    const session = await authService.login(req)
    tokenStorage.setSession(session)
    setUser(session.user)
  }, [])

  // A 401 from any API call ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear()
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const hasRole = useCallback((roles: readonly AuthRole[] | undefined) => !roles || (user !== null && roles.includes(user.role)), [user])

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, login, logout, hasRole }), [user, login, logout, hasRole])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
