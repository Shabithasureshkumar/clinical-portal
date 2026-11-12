import { TrendingDown, TrendingUp } from 'lucide-react'
import type { StatMetric, Tone } from '@/types'
import { STAT_ICONS } from '@/utils/icons'
import { TONES } from '@/utils/tones'
import { cn } from '@/utils/cn'
import { Card } from '../common/Card'

export function SparkBars({ data, color = '#15c8e9' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex h-[22px] items-end gap-[3px]" aria-hidden="true">
      {data.map((v, i) => (
        <span
          key={i}
          className="w-[4px] rounded-[1.5px]"
          style={{ height: `${Math.max(22, (v / max) * 100)}%`, background: color, opacity: 0.55 + (i / data.length) * 0.45 }}
        />
      ))}
    </div>
  )
}

export function IconTile({
  tone = 'brand',
  size = 46,
  children,
  round,
}: {
  tone?: Tone
  size?: number
  children: React.ReactNode
  round?: boolean
}) {
  const t = TONES[tone]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]', round ? 'rounded-full' : 'rounded-[13px]')}
      style={{ width: size, height: size, background: t.bg, color: t.text }}
    >
      {children}
    </span>
  )
}

interface StatCardProps {
  metric: StatMetric
  variant: 'icon' | 'compact' | 'plain'
}

/** Single stat-card component with three reference-matching variants. */
export function StatCard({ metric, variant }: StatCardProps) {
  const Icon = metric.icon ? STAT_ICONS[metric.icon] : null
  const tone = metric.tone ?? 'brand'

  if (variant === 'icon') {
    const spark = metric.spark ?? [3, 5, 4, 7, 8, 9, 11]
    return (
      <Card className="flex flex-col p-[25px]">
        <div className="flex items-start justify-between">
          <IconTile tone={tone}>{Icon && <Icon size={21} strokeWidth={1.9} />}</IconTile>
          <span className="flex items-center gap-1 text-[13.5px] font-semibold text-ok">
            <TrendingUp size={13} />
            {metric.delta}
          </span>
        </div>
        <p className="mt-[28px] text-[33px] font-bold leading-[36px] tracking-[-0.025em] text-ink">{metric.value}</p>
        <p className="mt-3 text-[15px] leading-[18px] text-[#4d5d70]">{metric.label}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-2 pt-[18px]">
          <p className="min-w-0 text-[13.5px] leading-[18px] text-faint">{metric.caption}</p>
          <SparkBars data={spark} />
        </div>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className="min-w-0 px-[18px] pb-[18px] pt-[16px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            {Icon && <Icon size={15} strokeWidth={2} />}
          </span>
          <p className="truncate text-[15px] text-[#4d5d70]">{metric.label}</p>
        </div>
        <p className="mt-2.5 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">{metric.value}</p>
        {metric.caption === 'plain' ? (
          <p className="mt-3 text-[14px] text-[#4d5d70]">{metric.note}</p>
        ) : (
          <p className={cn('mt-3 flex items-center gap-1.5 text-[14px]', metric.trendDown ? 'text-bad' : 'text-ok')}>
            {metric.trendDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            <span className="text-[#4d5d70]">
              <span className={cn('font-medium', metric.trendDown ? 'text-bad' : 'text-ok')}>{metric.note?.split(' ')[0]}</span>{' '}
              {metric.note?.split(' ').slice(1).join(' ')}
            </span>
          </p>
        )}
      </Card>
    )
  }

  return (
    <Card className="min-h-[174px] min-w-0 px-[25px] pb-[22px] pt-[24px]">
      <p className="text-[14.5px] text-[#4d5d70]">{metric.label}</p>
      <p className="mt-[20px] text-[28.5px] font-bold leading-[1.1] tracking-[-0.025em] text-ink">{metric.value}</p>
      <p className="mt-[20px] flex items-start gap-1.5 text-[13.5px] text-muted">
        <TrendingUp size={13} className="mt-[3px] shrink-0 text-ok" />
        <span>
          <span className="font-semibold text-ok">{metric.note?.split(' ')[0]}</span>{' '}
          {metric.note?.split(' ').slice(1).join(' ')}
        </span>
      </p>
    </Card>
  )
}
