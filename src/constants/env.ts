/** Centralised, environment-based configuration. Never read import.meta.env elsewhere. */
export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
} as const
