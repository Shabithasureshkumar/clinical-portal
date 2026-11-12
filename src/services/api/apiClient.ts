import { create, isAxiosError, type AxiosError, type AxiosInstance } from 'axios'
import { ENV } from '@/constants/env'
import type { ApiErrorShape } from '@/types'
import { tokenStorage } from './tokenStorage'

export class ApiError extends Error {
  readonly status?: number
  readonly details?: unknown

  constructor({ message, status, details }: ApiErrorShape) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/** Register what should happen on 401 (e.g. redirect to a login route once auth exists). */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  onUnauthorized = handler
}

export const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error
  if (isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string }>
    return new ApiError({
      message: err.response?.data?.message ?? err.message ?? 'Request failed',
      status: err.response?.status,
      details: err.response?.data,
    })
  }
  return new ApiError({ message: error instanceof Error ? error.message : 'Unexpected error' })
}

export const apiClient: AxiosInstance = create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeError(error)
    if (normalized.status === 401) {
      tokenStorage.clear()
      onUnauthorized?.()
    }
    return Promise.reject(normalized)
  },
)
