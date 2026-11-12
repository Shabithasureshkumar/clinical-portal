import { expect, test } from '@playwright/test'
import { ROUTES, signIn } from './helpers.ts'

test.describe('authentication', () => {
  test('redirects anonymous visitors to /login and returns them after sign-in', async ({ page }) => {
    await page.goto('/providers')
    await expect(page).toHaveURL(/\/login$/)
    await page.getByLabel('Email').fill('qa.tester@example.com')
    await page.getByLabel('Password').fill('correct-horse-battery')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/providers$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Providers' })).toBeVisible()
  })

  test('validates the login form without calling the backend', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    await page.getByLabel('Email').fill('bad')
    await page.getByLabel('Password').fill('short')
    await expect(page.getByText('Enter a valid email address')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('keeps the session and the current route across a browser refresh', async ({ page }) => {
    await signIn(page)
    await page.goto('/billing-revenue')
    await page.reload()
    await expect(page).toHaveURL(/\/billing-revenue$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Billing & revenue' })).toBeVisible()
  })

  test('signs out and protects routes again', async ({ page }) => {
    await signIn(page)
    await page.getByRole('button', { name: 'Account menu' }).first().click()
    await page.getByRole('menuitem', { name: /Sign out/ }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.goto('/settings/locations')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('shows a 403 page for a role without access', async ({ page }) => {
    await signIn(page, 'Nurse')
    await page.goto('/settings/clinic-profile')
    await expect(page.getByRole('heading', { name: 'You do not have access' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: /Settings/ })).toHaveCount(0)
  })
})

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('every sidebar link opens its page and is marked active', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Primary' })
    const links = await nav.getByRole('link').all()
    expect(links.length).toBe(8)
    for (const [i, route] of ROUTES.slice(0, 8).entries()) {
      await nav.getByRole('link').nth(i).click()
      await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible()
      await expect(nav.getByRole('link').nth(i)).toHaveAttribute('aria-current', 'page')
    }
  })

  test('supports back and forward navigation without reloading the page', async ({ page }) => {
    await page.evaluate(() => ((window as unknown as { pwMarker: string }).pwMarker = 'same-document'))
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: /Providers/ }).click()
    await nav.getByRole('link', { name: /Reports/ }).click()
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1, name: 'Providers' })).toBeVisible()
    await page.goForward()
    await expect(page.getByRole('heading', { level: 1, name: 'Reports & analytics' })).toBeVisible()
    expect(await page.evaluate(() => (window as unknown as { pwMarker?: string }).pwMarker)).toBe('same-document')
  })

  test('shows a 404 page for unknown URLs', async ({ page }) => {
    await page.goto('/no/such/page')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await page.getByRole('link', { name: 'Back to Home' }).click()
    await expect(page.getByRole('heading', { level: 1, name: /Good morning/ })).toBeVisible()
  })

  test('global search navigates with the keyboard', async ({ page }) => {
    await page.getByRole('combobox', { name: /Search pages/ }).fill('billing')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/billing-revenue$/)
  })
})
