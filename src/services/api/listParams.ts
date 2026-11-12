import type { PageResult } from '@/types'

/** Generic pagination / filter contract for list endpoints. Field names are an assumption until a backend contract exists. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  filters?: Record<string, string | number | boolean | undefined>
}

/** Serialises list params into Axios `params`, dropping empty values. */
export const toQuery = (params: ListParams = {}): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {}
  if (params.page) out.page = params.page
  if (params.pageSize) out.pageSize = params.pageSize
  if (params.search?.trim()) out.search = params.search.trim()
  if (params.sort) out.sort = params.sort
  for (const [k, v] of Object.entries(params.filters ?? {})) {
    if (v !== undefined && v !== '') out[k] = v
  }
  return out
}

/** Client-side adapter used by mock services to behave like a paginated endpoint. */
export const paginate = <T>(items: T[], params: ListParams = {}): PageResult<T> => {
  const pageSize = params.pageSize ?? 10
  const page = Math.max(1, params.page ?? 1)
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize }
}
