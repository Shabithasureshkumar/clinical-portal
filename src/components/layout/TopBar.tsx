import { ChevronDown, ChevronRight, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { routeTitle } from '@/constants/routes'
import { NotificationsMenu } from '@/features/notifications/NotificationsMenu'
import { useAuth } from '@/store/authStore'
import { AccountMenu } from './AccountMenu'
import { GlobalSearch } from './GlobalSearch'

interface TopBarProps {
  onMenu: () => void
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function TopBar({ onMenu }: TopBarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = routeTitle(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-[75px] items-center justify-between gap-4 border-b border-line-2 bg-white px-4 sm:px-[34px]">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} aria-label="Open navigation" className="rounded-[10px] border border-line p-2 text-ink lg:hidden">
          <Menu size={20} aria-hidden="true" />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-3 text-[14px]">
          <span className="hidden text-muted sm:inline">Workspace</span>
          <ChevronRight size={14} className="hidden text-muted sm:block" aria-hidden="true" />
          <span className="truncate font-semibold text-ink" aria-current="page">{title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-[22px]">
        <GlobalSearch className="hidden w-[270px] md:block" />
        <NotificationsMenu kind="messages" />
        <NotificationsMenu kind="notifications" />
        <AccountMenu
          renderTrigger={(p) => (
            <button type="button" {...p} className="flex items-center gap-3">
              <span className="sr-only">Account menu</span>
              <span aria-hidden="true" className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#06121f] text-[11px] font-bold text-white">{initialsOf(user?.name ?? 'U')}</span>
              <ChevronDown size={15} className="hidden text-muted sm:block" aria-hidden="true" />
            </button>
          )}
        />
      </div>
    </header>
  )
}
