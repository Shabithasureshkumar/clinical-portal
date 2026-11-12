import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export interface SectionActions {
  save: () => Promise<void>
  reset: () => void
}

interface SettingsContextValue {
  dirty: boolean
  saving: boolean
  setDirty: (value: boolean) => void
  setSaving: (value: boolean) => void
  bind: (actions: SectionActions | null) => void
  saveActive: () => Promise<void>
  resetActive: () => void
  hasForm: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

/** Lets the active section report unsaved changes so the page header and navigation guard can react. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirtyState] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasForm, setHasForm] = useState(false)
  const actions = useRef<SectionActions | null>(null)

  const setDirty = useCallback((v: boolean) => setDirtyState(v), [])
  const bind = useCallback((a: SectionActions | null) => {
    actions.current = a
    setHasForm(a !== null)
  }, [])
  const saveActive = useCallback(async () => {
    await actions.current?.save()
  }, [])
  const resetActive = useCallback(() => actions.current?.reset(), [])

  const value = useMemo(
    () => ({ dirty, saving, setDirty, setSaving, bind, saveActive, resetActive, hasForm }),
    [dirty, saving, setDirty, bind, saveActive, resetActive, hasForm],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
