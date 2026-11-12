import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api/apiClient'
import { useAsync } from './useAsync'

describe('useAsync', () => {
  it('moves from loading to data', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('ok')))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe('ok')
    expect(result.current.error).toBeNull()
  })

  it('exposes the error message when the request fails', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject(new ApiError({ message: 'Server unavailable', status: 503 }))))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Server unavailable')
    expect(result.current.data).toBeNull()
  })

  it('reloads on demand', async () => {
    const fetcher = vi.fn().mockResolvedValue('v')
    const { result } = renderHook(() => useAsync(fetcher))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.reload())
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })

  it('aborts the in-flight request on unmount', async () => {
    let signal: AbortSignal | undefined
    const { unmount } = renderHook(() =>
      useAsync((opts) => {
        signal = opts.signal
        return new Promise<string>(() => undefined)
      }),
    )
    await waitFor(() => expect(signal).toBeDefined())
    unmount()
    expect(signal?.aborted).toBe(true)
  })
})
