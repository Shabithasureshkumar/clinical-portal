import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@/components/common/Toast'
import { useSettingsContext } from '@/features/settings/SettingsContext'
import { normalizeError } from '@/services/api/apiClient'
import type { DocService } from '@/services/settingsService'

export type FormErrors = Record<string, string>

/**
 * Draft-based form state for a settings document: loading, dirty tracking,
 * validation, save / cancel and registration with the settings page guard.
 */
export function useSettingsForm<T>(service: DocService<T>, validate?: (draft: T) => FormErrors) {
  const notify = useToast()
  const ctx = useSettingsContext()
  const [saved, setSaved] = useState<T | null>(null)
  const [draft, setDraft] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [tick, setTick] = useState(0)
  const validateRef = useRef(validate)
  useEffect(() => {
    validateRef.current = validate
  })

  useEffect(() => {
    let cancelled = false
    service
      .get()
      .then((v) => {
        if (cancelled) return
        setSaved(v)
        setDraft(structuredClone(v))
      })
      .catch((e: unknown) => !cancelled && setLoadError(normalizeError(e).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // `tick` is a deliberate re-run trigger for reload().
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [service, tick])

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft])

  const patch = useCallback((partial: Partial<T>) => {
    setDraft((d) => (d ? { ...d, ...partial } : d))
  }, [])

  const reset = useCallback(() => {
    setDraft(saved ? structuredClone(saved) : saved)
    setErrors({})
  }, [saved])

  const save = useCallback(async () => {
    if (!draft) return
    const found = validateRef.current?.(draft) ?? {}
    setErrors(found)
    if (Object.keys(found).length > 0) {
      notify('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    ctx.setSaving(true)
    try {
      const result = await service.save(draft)
      setSaved(result)
      setDraft(structuredClone(result))
      notify('Changes saved (demo data, not stored on a server)')
    } catch (e) {
      notify(`Could not save: ${normalizeError(e).message}`)
    } finally {
      setSaving(false)
      ctx.setSaving(false)
    }
  }, [draft, service, notify, ctx])

  // Register stable wrappers once: re-binding on every keystroke would run the cleanup and clear the dirty flag.
  const actions = useRef({ save, reset })
  useEffect(() => {
    actions.current = { save, reset }
  })

  const { setDirty, bind } = ctx
  useEffect(() => {
    setDirty(dirty)
  }, [dirty, setDirty])
  useEffect(() => {
    bind({ save: () => actions.current.save(), reset: () => actions.current.reset() })
    return () => {
      bind(null)
      setDirty(false)
    }
  }, [bind, setDirty])

  return {
    draft,
    patch,
    loading,
    loadError,
    reload: () => {
      setLoading(true)
      setLoadError(null)
      setTick((t) => t + 1)
    },
    dirty,
    saving,
    errors,
    save,
    reset,
  }
}
