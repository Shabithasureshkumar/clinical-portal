import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '@/constants/navigation'
import { ROUTE_ROLES } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { SETTINGS_SECTIONS, settingsPath } from '@/constants/settings'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useAuth } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface Result {
  label: string
  hint: string
  to: string
}

/** Searches pages and settings sections the signed-in role can open. Press Ctrl/⌘ + K to focus. */
export function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  useClickOutside(ref, () => setOpen(false), open)

  const all = useMemo<Result[]>(() => {
    const pages = NAV_ITEMS.filter((n) => hasRole(ROUTE_ROLES[n.to])).map((n) => ({ label: n.label, hint: 'Page', to: n.to }))
    const settings = hasRole(ROUTE_ROLES[ROUTES.settings])
      ? SETTINGS_SECTIONS.map((s) => ({ label: s.label, hint: 'Settings', to: settingsPath(s.id) }))
      : []
    return [...pages, ...settings, { label: 'Help center', hint: 'Page', to: ROUTES.help }]
  }, [hasRole])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? all.filter((r) => r.label.toLowerCase().includes(q)) : all.slice(0, 6)
  }, [all, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const go = (r: Result) => {
    setOpen(false)
    setQuery('')
    navigate(r.to)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <label className="relative flex h-[42px] items-center rounded-[12px] border border-line-2 bg-page">
        <span className="sr-only">Search pages and settings</span>
        <Search size={14} className="pointer-events-none absolute left-4 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search anything..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && results[active]) {
              e.preventDefault()
              go(results[active])
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className="h-full w-full bg-transparent pl-10 pr-16 text-[14.5px] text-ink outline-none placeholder:text-muted"
        />
        <kbd className="absolute right-3 rounded-md border border-line bg-white px-2 py-0.5 text-[11px] text-muted" aria-hidden="true">⌘ K</kbd>
      </label>
      {open && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 z-40 mt-2 max-h-[320px] overflow-auto rounded-[14px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(15,40,60,0.16)]">
          {results.length === 0 && <li className="px-3 py-4 text-center text-[13.5px] text-muted">No matching pages</li>}
          {results.map((r, i) => (
            <li key={`${r.to}-${r.label}`} role="option" aria-selected={i === active}>
              <button type="button" tabIndex={-1} onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={cn('flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[14px] text-ink-2', i === active && 'bg-tint')}>
                {r.label}
                <span className="text-[11.5px] text-muted">{r.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
