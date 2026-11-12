import { CheckCircle2 } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ToastItem {
  id: number
  message: string
}

type Notify = (message: string) => void

const ToastContext = createContext<Notify | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const notify = useCallback<Notify>((message) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message }])
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  const value = useMemo(() => notify, [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-[12px] border border-line bg-white px-4 py-3 text-[14px] font-medium text-ink shadow-[0_12px_32px_rgba(15,40,60,0.16)]"
          >
            <CheckCircle2 size={18} className="text-ok" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): Notify {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
