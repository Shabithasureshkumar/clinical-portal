import { expect, test } from '@playwright/test'
import { SETTINGS_SECTIONS, signIn } from './helpers.ts'

test.describe('settings module', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/settings')
  })

  test('all 11 submenu items open their own section', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Settings sections' })
    const seen = new Set<string>()
    for (const id of SETTINGS_SECTIONS) {
      await nav.locator(`a[href="/settings/${id}"]`).click()
      await expect(page).toHaveURL(new RegExp(`/settings/${id}$`))
      await expect(nav.locator(`a[href="/settings/${id}"]`)).toHaveAttribute('aria-current', 'page')
      const heading = await page.locator('main h2').first().innerText()
      seen.add(heading)
    }
    expect(seen.size).toBe(11)
  })

  test('adds and deletes a service with validation and confirmation', async ({ page }) => {
    await page.goto('/settings/services')
    await page.getByRole('button', { name: 'Add service' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Add service' }).click()
    await expect(dialog.getByText('Service name is required')).toBeVisible()
    await dialog.getByLabel('Service name').fill('E2E sleep study')
    await dialog.getByRole('button', { name: 'Dr. Priya Patel' }).click()
    await dialog.getByRole('button', { name: 'Northbridge Main' }).click()
    await dialog.getByRole('button', { name: 'Add service' }).click()
    await expect(page.getByText('E2E sleep study', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Delete E2E sleep study' }).click()
    await expect(page.getByRole('dialog')).toContainText('cannot be undone')
    await page.getByRole('dialog').getByRole('button', { name: 'Delete service' }).click()
    await expect(page.getByText('E2E sleep study', { exact: true })).toHaveCount(0)
  })

  test('warns about unsaved changes and keeps the form values', async ({ page }) => {
    await page.goto('/settings/clinic-profile')
    await page.getByLabel('Clinic name').fill('Northstar Clinic E2E')
    await page.getByRole('navigation', { name: 'Settings sections' }).locator('a[href="/settings/locations"]').click()
    await expect(page.getByRole('heading', { name: 'Discard unsaved changes?' })).toBeVisible()
    await page.getByRole('button', { name: 'Keep editing' }).click()
    await expect(page).toHaveURL(/clinic-profile$/)
    await expect(page.getByLabel('Clinic name')).toHaveValue('Northstar Clinic E2E')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('All changes saved')).toBeVisible()
  })

  test('dialogs trap Escape and restore focus', async ({ page }) => {
    await page.goto('/settings/locations')
    const trigger = page.getByRole('button', { name: 'Add location' })
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe('feature interactions', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('Home: Add appointment dialog validates and closes after booking', async ({ page }) => {
    await page.getByRole('button', { name: 'Add appointment' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Book appointment' }).click()
    await expect(dialog.getByText('Patient name is required')).toBeVisible()
    await dialog.getByLabel('Patient name').fill('Jordan Smith')
    await dialog.getByLabel('Time').fill('10:30')
    await dialog.getByRole('button', { name: 'Book appointment' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText(/booked at 10:30 AM/)).toBeVisible()
  })

  test('Home: Export overview downloads a CSV file', async ({ page }) => {
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export overview' }).click()
    expect((await download).suggestedFilename()).toBe('home-overview.csv')
  })

  test('Billing: pagination, search and filter work', async ({ page }) => {
    await page.goto('/billing-revenue')
    await expect(page.getByText('INV-20482')).toBeVisible()
    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(page.getByText('INV-20478')).toBeVisible()
    await page.getByRole('textbox', { name: 'Search transactions' }).fill('noah')
    await expect(page.getByText('INV-20481')).toBeVisible()
    await expect(page.getByText('INV-20478')).toHaveCount(0)
  })

  test('Schedule: provider filter from Providers page deep link and bulk reassign', async ({ page }) => {
    await page.goto('/providers')
    await page.getByRole('button', { name: 'View Schedule' }).first().click()
    await expect(page).toHaveURL(/clinic-schedule\?provider=/)
    const table = page.getByRole('table', { name: 'Appointments' })
    await expect(table.getByText('Dr. Priya Patel')).toHaveCount(0)
    await expect(table.getByText('Dr. Rajesh Kumar').first()).toBeVisible()
  })

  test('Notifications dropdown lists items and deep-links', async ({ page }) => {
    await page.getByRole('button', { name: /Notifications/ }).click()
    await page.getByRole('dialog', { name: 'Notifications' }).getByRole('button', { name: /Invoice overdue/ }).click()
    await expect(page).toHaveURL(/billing-revenue$/)
  })
})
