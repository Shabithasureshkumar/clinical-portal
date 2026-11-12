import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint } from '@/types'

const AXIS = { fontSize: 11.5, fill: '#7d8b9a' }
const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e7edf2',
  boxShadow: '0 8px 24px rgba(15,40,60,0.12)',
  fontSize: 13,
}

/** Home: three-series line chart (Total / Completed / In Progress). */
export function AppointmentsLineChart({ data, fixedScale = true }: { data: ChartPoint[]; fixedScale?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="#edf2f5" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS} tickMargin={10} />
        <YAxis axisLine={false} tickLine={false} tick={AXIS} ticks={fixedScale ? [0, 9, 18, 27, 36] : undefined} domain={fixedScale ? [0, 36] : [0, 'auto']} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          isAnimationActive={false}
          type="monotone"
          dataKey="progress"
          name="In Progress"
          stroke="#7b8794"
          strokeWidth={1.6}
          dot={false}
        />
        <Line isAnimationActive={false} type="monotone" dataKey="completed" name="Completed" stroke="#1c9fe0" strokeWidth={2} dot={false} />
        <Line
          isAnimationActive={false}
          type="monotone"
          dataKey="total"
          name="Total"
          stroke="#0cc0de"
          strokeWidth={2.4}
          dot={{ r: 3.5, fill: '#fff', stroke: '#0cc0de', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Home: revenue by hour. */
export function RevenueBarChart({ data, fixedScale = true }: { data: { label: string; value: number }[]; fixedScale?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -12 }} barCategoryGap={4}>
        <CartesianGrid stroke="#edf2f5" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ ...AXIS, fontSize: 10.5 }} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ ...AXIS, fontSize: 10.5 }} ticks={fixedScale ? [0, 350, 700, 1050, 1400] : undefined} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(21,200,233,0.08)' }} />
        <Bar isAnimationActive={false} dataKey="value" name="Revenue" fill="#00b8d2" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Billing: smooth gradient area. */
export function RevenueAreaChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15c8e9" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#15c8e9" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS} interval={0} tickMargin={12} />
        <YAxis hide domain={[0, 'dataMax + 40']} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area isAnimationActive={false} type="monotone" dataKey="value" name="Revenue" stroke="#12c2e6" strokeWidth={3} fill="url(#rev-fill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Reports: appointment-mix donut with centered total. */
export function MixDonut({
  data,
  total,
}: {
  data: { name: string; value: number; color: string }[]
  total: string
}) {
  return (
    <div className="relative h-[158px] w-[158px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie isAnimationActive={false} data={data} dataKey="value" innerRadius={50} outerRadius={78} startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-bold text-ink">{total}</span>
        <span className="text-[12px] text-faint">visits</span>
      </div>
    </div>
  )
}

/** Tiny line used in provider cards. */
export function Sparkline({ data, width = 240, height = 40 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => [i * step, height - 4 - ((v - min) / span) * (height - 10)] as const)
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1] as readonly [number, number]
    const cx = (px + x) / 2
    return `${acc} C${cx},${py} ${cx},${y} ${x},${y}`
  }, '')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[50px] w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="#12c2e6" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Reports: gradient vertical bars with optional emphasised columns. */
export function GradientBars({ data }: { data: { value: number; emphasis?: boolean }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-[10px]">
      {data.map((d, i) => (
        <div
          key={i}
          className="w-full max-w-[52px] flex-1 rounded-t-[6px]"
          style={{
            height: `${(d.value / 140) * 100}%`,
            background: d.emphasis
              ? 'linear-gradient(180deg,#0aa3c4 0%,#5cc7d8 100%)'
              : 'linear-gradient(180deg,#19c9ea 0%,#9be8f6 100%)',
          }}
        />
      ))}
    </div>
  )
}
