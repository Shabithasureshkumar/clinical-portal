import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { tokenStorage } from '@/services/api/tokenStorage'

// Lazy routes and the mock transport's artificial latency make first renders slower than the 1s default.
configure({ asyncUtilTimeout: 10_000 })

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
window.scrollTo = () => {}
window.matchMedia =
  window.matchMedia ??
  (((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as unknown as typeof window.matchMedia)

afterEach(() => {
  cleanup()
  tokenStorage.clear()
  window.sessionStorage.clear()
})
