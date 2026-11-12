import { CircleHelp, LogOut, Settings, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Popover } from '@/components/common/Popover'
import { useToast } from '@/components/common/Toast'
import { ROUTES } from '@/constants/routes'
import { settingsPath } from '@/constants/settings'
import { useAuth } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface AccountMenuProps {
  renderTrigger: (props: Record<string, unknown>) => ReactNode
  align?: 'left' | 'right'
  className?: string
  side?: 'down' | 'up'
}

const itemClass = 'flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[14px] text-ink-2 hover:bg-tint focus-visible:bg-tint'

function MenuLink({ to, icon: Icon, children, onNavigate }: { to: string; icon: LucideIcon; children: ReactNode; onNavigate: () => void }) {
  return (
    <Link to={to} role="menuitem" onClick={onNavigate} className={itemClass}>
      <Icon size={16} />
      {children}
    </Link>
  )
}

/** Signed-in user menu: account info, shortcuts and sign out. */
export function AccountMenu({ renderTrigger, align = 'right', className, side = 'down' }: AccountMenuProps) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const notify = useToast()

  return (
    <Popover
      align={align}
      label="Account menu"
      className={className}
      panelClassName={cn('w-[260px]', side === 'up' && 'bottom-full mb-2 mt-0')}
      renderTrigger={(p) => renderTrigger(p)}
    >
      {(close) => (
        <>
          <div className="border-b border-line-2 px-3 pb-3 pt-2">
            <p className="truncate text-[14px] font-bold text-ink">{user?.name}</p>
            <p className="truncate text-[12.5px] text-muted">{user?.email}</p>
            <p className="mt-1 text-[12px] font-medium text-brand-700">{user?.role}</p>
          </div>
          <div className="pt-1.5">
            {hasRole(['Clinic administrator']) && (
              <MenuLink to={settingsPath('clinic-profile')} icon={Settings} onNavigate={close}>
                Clinic settings
              </MenuLink>
            )}
            <MenuLink to={ROUTES.help} icon={CircleHelp} onNavigate={close}>
              Help center
            </MenuLink>
            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, 'text-bad')}
              onClick={async () => {
                close()
                await logout()
                navigate(ROUTES.login, { replace: true })
                notify('You have been signed out')
              }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </>
      )}
    </Popover>
  )
}
