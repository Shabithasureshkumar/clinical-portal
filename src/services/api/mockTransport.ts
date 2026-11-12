/**
 * Mock transport used by every service until real API contracts exist.
 * Replace `fromMock(...)` with an `apiClient` call inside each service function
 * once backend endpoints and response shapes are defined. Nothing resolved here is persisted.
 *
 * Supports cancellation through an AbortSignal, mirroring Axios request cancellation.
 */
export const fromMock = <T>(data: T, delayMs = 350, signal?: AbortSignal): Promise<T> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      // structuredClone keeps mock data immutable for consumers.
      resolve(structuredClone(data))
    }, delayMs)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })

export interface RequestOptions {
  signal?: AbortSignal
}
