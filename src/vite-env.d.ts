/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_SUPPORT_EMAIL?: string
  readonly VITE_SUPPORT_PHONE?: string
  readonly VITE_DOCS_URL?: string
  readonly VITE_STATUS_URL?: string
  readonly VITE_TERMS_URL?: string
  readonly VITE_PRIVACY_URL?: string
  readonly VITE_COOKIE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
