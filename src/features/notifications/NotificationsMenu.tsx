import { Bell, MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover } from '@/components/common/Popover'
import { notificationService } from '@/services/notificationService'
import type { AppNotification } from '@/types'
import { cn } from '@/utils/cn'

interface NotificationsMenuProps {
  kind: 'notifications' | 'messages'
  /** Custom trigger; defaults to the top bar icon button. */
  renderTrigger?: (props: Record<string, unknown>, unread: number) => ReactNode
}

/** Dropdown feed for notifications or messages with unread dot, mark-as-read and deep links. */
export function NotificationsMenu({ kind, renderTrigger }: NotificationsMenuProps) {
  const navigate = useNavigate()
  const [items, setItems] = useState<AppNotification[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback((signal?: AbortSignal) => {
    const req = kind === 'messages' ? notificationService.listMessages({ signal }) : notificationService.list({ signal })
    req
      .then((v) => {
        setItems(v)
        setError(false)
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === 'AbortError')) setError(true)
      })
      .finally(() => setLoading(false))
  }, [kind])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const unread = items.filter((i) => !i.read).length
  const Icon = kind === 'messages' ? MessageSquare : Bell
  const label = kind === 'messages' ? 'Messages' : 'Notifications'

  const open = async (n: AppNotification, close: () => void) => {
    await notificationService.markRead(n.id)
    setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)))
    close()
    navigate(n.to)
  }

  return (
    <Popover
      label={label}
      role="dialog"
      panelClassName="w-[min(360px,calc(100vw-32px))] !p-0"
      renderTrigger={(p) =>
        renderTrigger ? (
          renderTrigger(p, unread)
        ) : (
          <button type="button" {...p} aria-label={unread ? `${label}, ${unread} unread` : label} className="relative rounded-md p-1 text-ink-2 hover:text-ink">
            <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-[8px] w-[8px] rounded-full bg-bad" aria-hidden="true" />}
          </button>
        )
      }
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line-2 px-4 py-3">
            <h2 className="text-[15px] font-bold text-ink">{label}</h2>
            {kind === 'notifications' && unread > 0 && (
              <button
                type="button"
                className="text-[13px] font-semibold text-brand-600 hover:underline"
                onClick={async () => {
                  await notificationService.markAllRead()
                  setItems((prev) => prev.map((p) => ({ ...p, read: true })))
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-[360px] overflow-auto">
            {loading && <li className="px-4 py-6 text-center text-[13.5px] text-muted">Loading…</li>}
            {error && (
              <li className="px-4 py-6 text-center text-[13.5px] text-bad" role="alert">
                Could not load {label.toLowerCase()}.{' '}
                <button type="button" className="font-semibold underline" onClick={() => { setLoading(true); load() }}>
                  Retry
                </button>
              </li>
            )}
            {!loading && !error && items.length === 0 && <li className="px-4 py-8 text-center text-[13.5px] text-muted">You are all caught up.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button type="button" aria-label={`${n.title}. ${n.body} ${n.time}${n.read ? '' : ' (unread)'}`} onClick={() => open(n, close)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-tint', !n.read && 'bg-brand-50/50')}>
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink">{n.title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-muted">{n.body}</span>
                    <span className="mt-1 block text-[11.5px] text-muted">{n.time}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Popover>
  )
}
