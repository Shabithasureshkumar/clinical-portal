import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { EmptyState } from '../common/States'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** Return a comparable value to enable sorting on this column. */
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  /** Tailwind classes for grid-template-columns, applied to header and rows. */
  headerClassName?: string
  rowClassName?: string
  minWidth?: number
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

/** Generic sortable table with a responsive horizontal-scroll wrapper. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  headerClassName,
  rowClassName,
  minWidth = 720,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    return rows.toSorted((a, b) => {
      const av = get(a)
      const bv = get(b)
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort, columns])

  const toggle = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  const alignClass = (a?: Column<T>['align']) => (a === 'right' ? 'justify-end text-right' : a === 'center' ? 'justify-center text-center' : '')

  return (
    <div className="scrollbar-thin overflow-x-auto" role="region" aria-label="Data table" tabIndex={0}>
      <div role="table" style={{ minWidth }}>
        <div role="row" className={cn('grid items-center', headerClassName)}>
          {columns.map((c) => {
            const active = sort?.key === c.key
            return (
              <div
                key={c.key}
                role="columnheader"
                aria-sort={active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                className={cn('flex items-center', alignClass(c.align), c.headerClassName)}
              >
                {c.sortValue ? (
                  <button type="button" onClick={() => toggle(c.key)} className="group inline-flex items-center gap-1.5 [font:inherit] [letter-spacing:inherit] [text-transform:inherit]">
                    {c.header}
                    {active ? sort?.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ChevronsUpDown size={12} className="opacity-0 transition group-hover:opacity-60 group-focus-visible:opacity-60" />}
                  </button>
                ) : (
                  c.header
                )}
              </div>
            )
          })}
        </div>
        {sorted.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          sorted.map((row) => (
            <div key={rowKey(row)} role="row" className={cn('grid items-center', rowClassName, headerClassName && undefined)}>
              {columns.map((c) => (
                <div key={c.key} role="cell" className={cn('min-w-0', alignClass(c.align) && 'flex', alignClass(c.align), c.className)}>
                  {c.render(row)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
