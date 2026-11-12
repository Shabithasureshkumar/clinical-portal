import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/components/common/Toast'
import { normalizeError } from '@/services/api/apiClient'
import type { CollectionService } from '@/services/settingsService'

/** Loads a collection and exposes create / update / remove with toast feedback. */
export function useCollection<T extends { id: string }>(service: CollectionService<T>) {
  const notify = useToast()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    service
      .list()
      .then((v) => !cancelled && setItems(v))
      .catch((e: unknown) => !cancelled && setError(normalizeError(e).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // `tick` is a deliberate re-run trigger for reload().
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [service, tick])

  const run = useCallback(
    async <R,>(job: () => Promise<R>, success: string): Promise<R | undefined> => {
      try {
        const result = await job()
        notify(success)
        return result
      } catch (e) {
        notify(`Action failed: ${normalizeError(e).message}`)
        return undefined
      }
    },
    [notify],
  )

  const create = useCallback(
    async (item: Omit<T, 'id'>, message = 'Added') => {
      const created = await run(() => service.create(item), message)
      if (created) setItems((prev) => [...prev, created])
      return created
    },
    [service, run],
  )

  const update = useCallback(
    async (item: T, message = 'Changes saved') => {
      const updated = await run(() => service.update(item), message)
      if (updated) setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      return updated
    },
    [service, run],
  )

  const remove = useCallback(
    async (id: string, message = 'Removed') => {
      const ok = await run(() => service.remove(id).then(() => true), message)
      if (ok) setItems((prev) => prev.filter((p) => p.id !== id))
      return ok === true
    },
    [service, run],
  )

  /** Replace local items (used when one change affects several rows, e.g. primary location). */
  const replaceAll = useCallback((next: T[]) => setItems(next), [])

  return { items, loading, error, reload: () => {
      setLoading(true)
      setError(null)
      setTick((t) => t + 1)
    }, create, update, remove, replaceAll }
}
