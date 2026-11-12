import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { SETTINGS_SECTIONS, settingsPath } from '@/constants/settings'
import type { SettingsSectionId } from '@/types'
import { cn } from '@/utils/cn'

interface SettingsSidebarProps {
  active: SettingsSectionId
}

/** Secondary navigation: a card list on large screens, a compact collapsible menu below lg. */
export function SettingsSidebar({ active }: SettingsSidebarProps) {
  const [open, setOpen] = useState(false)
  const current = SETTINGS_SECTIONS.find((s) => s.id === active)
  const CurrentIcon = current?.icon

  return (
    <Card className="rounded-[20px] p-2.5 lg:sticky lg:top-[100px]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="settings-nav-list"
        onClick={() => setOpen((o) => !o)}
        className="flex h-[46px] w-full items-center gap-3 rounded-[12px] bg-brand-50 px-3 text-left text-[14px] font-semibold text-brand-700 lg:hidden"
      >
        {CurrentIcon && <CurrentIcon size={17} strokeWidth={1.7} />}
        <span className="flex-1">{current?.label}</span>
        <ChevronDown size={16} className={cn('transition', open && 'rotate-180')} />
      </button>

      <nav aria-label="Settings sections" id="settings-nav-list" className={cn('mt-2 lg:mt-0 lg:block', open ? 'block' : 'hidden')}>
        <ul className="space-y-0.5">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <NavLink
                to={settingsPath(id)}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex h-[44px] w-full items-center gap-3 whitespace-nowrap rounded-[12px] px-3 text-left text-[13.5px] transition',
                  active === id ? 'bg-brand-50 font-semibold text-brand-700' : 'text-[#4d5d70] hover:bg-tint',
                )}
              >
                <Icon size={17} strokeWidth={1.7} />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="text-faint" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  )
}
