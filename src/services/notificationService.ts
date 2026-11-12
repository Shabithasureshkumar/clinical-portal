import { messagesFeedMock, notificationsFeedMock } from '@/mocks/notifications.mock'
import type { AppNotification } from '@/types'
import { fromMock, type RequestOptions } from './api/mockTransport'

let store: AppNotification[] = structuredClone(notificationsFeedMock)

/** In-memory notification feed (demo). Replace with real endpoints when the contract exists. */
export const notificationService = {
  list: (opts?: RequestOptions): Promise<AppNotification[]> => fromMock(store, 250, opts?.signal),
  listMessages: (opts?: RequestOptions): Promise<AppNotification[]> => fromMock(messagesFeedMock, 250, opts?.signal),
  markRead: async (id: string): Promise<void> => {
    store = store.map((n) => (n.id === id ? { ...n, read: true } : n))
    return fromMock(undefined, 120)
  },
  markAllRead: async (): Promise<void> => {
    store = store.map((n) => ({ ...n, read: true }))
    return fromMock(undefined, 150)
  },
}
