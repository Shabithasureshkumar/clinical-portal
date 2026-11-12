import {
  appointmentDefaultsMock,
  auditLogMock,
  billingSettingsMock,
  clinicUsersMock,
  faqMock,
  insuranceMock,
  integrationsMock,
  locationsMock,
  loginActivityMock,
  notificationsMock,
  profileMock,
  securityMock,
  servicesMock,
  sessionsMock,
  virtualVisitsMock,
} from '@/mocks/settings.mock'
import type {
  ActiveSession,
  AppointmentDefaults,
  AuditLogItem,
  BillingSettings,
  ClinicProfile,
  ClinicServiceItem,
  ClinicUser,
  DataExportRequest,
  FaqItem,
  InsuranceProvider,
  IntegrationItem,
  LoginActivityItem,
  NotificationSettings,
  SecuritySettings,
  SettingsLocation,
  VirtualVisitSettings,
} from '@/types'
import { fromMock } from './api/mockTransport'

/**
 * Settings data access.
 *
 * Every function here currently resolves from the in-memory mock store, so changes live
 * only for the current browser session and are NOT persisted to any server.
 * When real API contracts exist, replace the body of each function with an `apiClient` call
 * and keep the signatures, so the UI does not change.
 */

export interface DocService<T> {
  get: () => Promise<T>
  save: (value: T) => Promise<T>
}

export interface CollectionService<T extends { id: string }> {
  list: () => Promise<T[]>
  create: (item: Omit<T, 'id'>) => Promise<T>
  update: (item: T) => Promise<T>
  remove: (id: string) => Promise<void>
}

const makeDoc = <T>(seed: T): DocService<T> => {
  let store = structuredClone(seed)
  return {
    get: () => fromMock(store),
    save: async (value) => {
      store = structuredClone(value)
      return fromMock(store, 450)
    },
  }
}

const makeCollection = <T extends { id: string }>(seed: T[], prefix: string): CollectionService<T> => {
  let store = structuredClone(seed)
  return {
    list: () => fromMock(store),
    create: async (item) => {
      const created = { ...item, id: `${prefix}-${Date.now()}` } as T
      store = [...store, created]
      return fromMock(created, 350)
    },
    update: async (item) => {
      store = store.map((s) => (s.id === item.id ? item : s))
      return fromMock(item, 350)
    },
    remove: async (id) => {
      store = store.filter((s) => s.id !== id)
      return fromMock(undefined, 300)
    },
  }
}

const exportRequests: DataExportRequest[] = []

export const settingsApi = {
  profile: makeDoc<ClinicProfile>(profileMock),
  locations: makeCollection<SettingsLocation>(locationsMock, 'loc'),
  services: makeCollection<ClinicServiceItem>(servicesMock, 'svc'),
  appointmentDefaults: makeDoc<AppointmentDefaults>(appointmentDefaultsMock),
  virtualVisits: makeDoc<VirtualVisitSettings>(virtualVisitsMock),
  billing: makeDoc<BillingSettings>(billingSettingsMock),
  insurance: makeCollection<InsuranceProvider>(insuranceMock, 'ins'),
  notifications: makeDoc<NotificationSettings>(notificationsMock),
  integrations: makeCollection<IntegrationItem>(integrationsMock, 'int'),
  users: makeCollection<ClinicUser>(clinicUsersMock, 'cu'),
  security: makeDoc<SecuritySettings>(securityMock),
  sessions: makeCollection<ActiveSession>(sessionsMock, 'ses'),
  loginActivity: { list: (): Promise<LoginActivityItem[]> => fromMock(loginActivityMock) },
  auditLog: { list: (): Promise<AuditLogItem[]> => fromMock(auditLogMock) },
  faq: { list: (): Promise<FaqItem[]> => fromMock(faqMock) },
  dataExports: {
    list: (): Promise<DataExportRequest[]> => fromMock([...exportRequests]),
    request: async (scope: string): Promise<DataExportRequest> => {
      const req: DataExportRequest = {
        id: `exp-${Date.now()}`,
        requestedAt: new Date().toLocaleString(),
        scope,
        status: 'Requested (demo)',
      }
      exportRequests.push(req)
      return fromMock(req, 500)
    },
  },
}
