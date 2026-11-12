import { Building2, Check, ChevronDown, CircleHelp, MoreHorizontal, Sparkles, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Popover } from '@/components/common/Popover'
import { useToast } from '@/components/common/Toast'
import { NAV_ITEMS } from '@/constants/navigation'
import { ROUTE_ROLES } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/store/authStore'
import { useWorkspace, WORKSPACE_LOCATIONS } from '@/store/workspaceStore'
import { cn } from '@/utils/cn'
import { Avatar } from '../common/Avatar'
import { Logo } from '../common/Logo'
import { AccountMenu } from './AccountMenu'

interface SidebarProps {
  /** Mobile drawer state; ignored on lg+ where the sidebar is static. */
  open: boolean
  onClose: () => void
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function LocationSwitcher() {
  const { location, setLocation } = useWorkspace()
  const notify = useToast()
  return (
    <Popover
      align="left"
      label="Clinic location"
      className="mt-[24px]"
      panelClassName="w-full"
      renderTrigger={(p) => (
        <button
          type="button"
          {...p}
          className="flex w-full items-center gap-3 rounded-[16px] border border-line bg-white p-3 text-left shadow-soft transition hover:bg-tint"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-100 text-brand-600">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-bold text-ink">Northstar Clinic</span>
            <span className="block truncate text-[12px] text-muted">{location}</span>
            <span className="sr-only">Switch clinic location, current: {location}</span>          </span>
          <ChevronDown size={16} className="shrink-0 text-ink" aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <ul>
          {WORKSPACE_LOCATIONS.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === location}
                onClick={() => {
                  setLocation(l)
                  close()
                  notify(`Location set to ${l} (demo data is not filtered by location yet)`)
                }}
                className="flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[13.5px] text-ink-2 hover:bg-tint"
              >
                {l}
                {l === location && <Check size={14} className="text-brand-600" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { user, hasRole } = useAuth()
  const items = NAV_ITEMS.filter((n) => hasRole(ROUTE_ROLES[n.to]))
  return (
    <div className="flex min-h-full flex-col">
      <div className="px-[21px] pb-0 pt-[48px]">
        <div className="pl-[24px]">
          <Logo />
        </div>

        <LocationSwitcher />

        <p className="mb-[13px] ml-[12px] mt-[24px] text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Workspace</p>

        <nav aria-label="Primary" className="flex flex-col gap-[2px]">
          {items.map(({ label, to, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex h-[46px] items-center gap-[13px] rounded-[13px] px-[14px] text-[13.5px] font-medium transition',
                  isActive
                    ? 'bg-linear-to-b from-[#1fcdec] to-[#10c0e4] font-semibold text-white shadow-[0_8px_20px_rgba(21,200,233,0.3)]'
                    : 'text-[#4d5d70] hover:bg-tint',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge !== undefined && (
                    <span
                      className={cn(
                        'text-[12px] font-semibold',
                        isActive ? 'flex h-[24px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 text-[#00778f]' : 'text-[#00778f]',
                      )}
                    >
                      {badge}
                      <span className="sr-only"> items</span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-[21px] pb-[18px]">
        <div className="flex items-center gap-3 rounded-[14px] border border-brand-100 bg-linear-to-r from-brand-50 to-white p-[13px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-b from-[#2bd2ef] to-[#10bfe3] text-white">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-bold text-ink">Mednevo AI</span>
            <span className="block text-[11px] text-muted">Intelligence active</span>
          </span>
          <span className="h-[7px] w-[7px] rounded-full bg-ok" role="img" aria-label="Active" />
        </div>

        <NavLink
          to={ROUTES.help}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn('mt-[18px] flex h-[40px] w-full items-center gap-3 rounded-[12px] px-[14px] text-[13.5px] font-medium hover:bg-tint', isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-[#4d5d70]')
          }
        >
          <CircleHelp size={18} strokeWidth={1.7} aria-hidden="true" />
          Help center
        </NavLink>

        <div className="mt-[10px] flex items-center gap-3 border-t border-line-2 px-[10px] pt-[16px]">
          <Avatar initials={initialsOf(user?.name ?? 'U')} size={34} tint="#d5f6fc" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-bold text-ink">{user?.name ?? 'User'}</span>
            <span className="block truncate text-[11px] text-muted">{user?.role}</span>
          </span>
          <AccountMenu
            align="left"
            side="up"
            renderTrigger={(p) => (
              <button type="button" {...p} aria-label="Account menu" className="rounded-md p-1 text-ink hover:bg-tint">
                <MoreHorizontal size={18} aria-hidden="true" />
              </button>
            )}
          />
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: static column */}
      <aside aria-label="Sidebar" className="scrollbar-thin fixed inset-y-0 left-0 z-30 hidden w-[260px] overflow-y-auto border-r border-line-2 bg-white lg:block 2xl:w-[295px]">
        <SidebarContent onNavigate={() => undefined} />
      </aside>

      {/* Mobile / tablet: drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
        <button type="button" tabIndex={-1} aria-label="Dismiss navigation" className={cn('absolute inset-0 h-full w-full cursor-default bg-[#0c1b2e]/40 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
        <aside
          aria-label="Navigation drawer"
          className={cn(
            'absolute inset-y-0 left-0 w-[290px] max-w-[85vw] overflow-y-auto bg-white shadow-2xl transition-transform',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button type="button" onClick={onClose} aria-label="Close navigation" className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-tint">
            <X size={18} />
          </button>
          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    </>
  )
}
