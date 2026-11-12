import { describe, expect, it } from 'vitest'
import { paginate, toQuery } from './listParams'
import { fromMock } from './mockTransport'
import { ApiError, normalizeError } from './apiClient'
import { tokenStorage } from './tokenStorage'

describe('fromMock', () => {
  it('resolves a deep copy of the data', async () => {
    const source = { n: 1 }
    const result = await fromMock(source, 1)
    expect(result).toEqual(source)
    expect(result).not.toBe(source)
  })

  it('rejects with AbortError when the signal aborts mid-flight', async () => {
    const controller = new AbortController()
    const pending = fromMock('x', 500, controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects immediately for an already aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(fromMock('x', 10, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('list params', () => {
  it('serialises only meaningful values', () => {
    expect(toQuery({ page: 2, pageSize: 10, search: '  ann ', filters: { status: 'open', empty: '', skip: undefined } })).toEqual({
      page: 2,
      pageSize: 10,
      search: 'ann',
      status: 'open',
    })
  })

  it('paginates a list', () => {
    const items = Array.from({ length: 25 }, (_, i) => i)
    expect(paginate(items, { page: 3, pageSize: 10 })).toEqual({ items: [20, 21, 22, 23, 24], total: 25, page: 3, pageSize: 10 })
  })
})

describe('normalizeError', () => {
  it('passes ApiError through and wraps unknown errors', () => {
    const api = new ApiError({ message: 'boom', status: 500 })
    expect(normalizeError(api)).toBe(api)
    expect(normalizeError(new Error('plain')).message).toBe('plain')
    expect(normalizeError('weird').message).toBe('Unexpected error')
  })
})

const session = (expiresAt: string) => ({ user: { id: '1', name: 'A', email: 'a@b.co', role: 'Doctor' as const }, accessToken: 't', expiresAt })

describe('tokenStorage', () => {
  it('returns a stored session until it expires', () => {
    tokenStorage.setSession(session(new Date(Date.now() + 60_000).toISOString()))
    expect(tokenStorage.get()).toBe('t')
    tokenStorage.clear()
    expect(tokenStorage.get()).toBeNull()
  })

  it('drops expired sessions', () => {
    tokenStorage.setSession(session(new Date(Date.now() - 1000).toISOString()))
    expect(tokenStorage.getSession()).toBeNull()
  })

  it('ignores corrupt storage', () => {
    tokenStorage.clear()
    window.sessionStorage.setItem('mednevo.session', '{not json')
    expect(tokenStorage.getSession()).toBeNull()
  })
})
