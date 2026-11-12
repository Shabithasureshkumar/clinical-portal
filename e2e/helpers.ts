import { expect, type Page } from '@playwright/test'

export const ROUTES = [
  { path: '/', heading: /Good morning/ },
  { path: '/clinic-schedule', heading: 'Clinic Schedule' },
  { path: '/providers', heading: 'Providers' },
  { path: '/billing-revenue', heading: 'Billing & revenue' },
  { path: '/reports-analytics', heading: 'Reports & analytics' },
  { path: '/user-management', heading: 'User Management' },
  { path: '/clinic-management', heading: 'Clinic Management' },
  { path: '/settings/clinic-profile', heading: 'Clinic settings' },
  { path: '/help', heading: 'Help center' },
] as const

export const SETTINGS_SECTIONS = [
  'clinic-profile',
  'locations',
  'services',
  'appointment-defaults',
  'virtual-visits',
  'billing-insurance',
  'notifications',
  'integrations',
  'user-management',
  'data-privacy',
  'help-legal',
] as const

/** Signs in through the real login form (demo adapter) and waits for Home. */
export async function signIn(page: Page, role = 'Clinic administrator'): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill('qa.tester@example.com')
  await page.getByLabel('Password').fill('correct-horse-battery')
  await page.getByLabel('Demo role').selectOption(role)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Good morning/ })).toBeVisible()
}

export async function hasHorizontalOverflow(page: Page): Promise<{ overflow: boolean; scrollWidth: number; clientWidth: number }> {
  return page.evaluate(() => {
    const el = document.documentElement
    return { overflow: el.scrollWidth > el.clientWidth + 1, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
  })
}
