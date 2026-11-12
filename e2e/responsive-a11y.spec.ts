import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { hasHorizontalOverflow, ROUTES, signIn } from './helpers.ts'

const WIDTHS = [
  1920, 1600, 1440, 1366, // desktop
  1280, 1024, // laptop
  820, 768, // tablet
  430, 390, 375, 360, 320, // mobile
]

test.describe('responsive layout: no horizontal page overflow', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await signIn(page)
      const failures: string[] = []
      for (const route of ROUTES) {
        await page.goto(route.path)
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
        await page.waitForTimeout(150)
        const r = await hasHorizontalOverflow(page)
        if (r.overflow) failures.push(`${route.path}: scrollWidth ${r.scrollWidth} > clientWidth ${r.clientWidth}`)
      }
      expect(failures, failures.join('\n')).toEqual([])
    })
  }

  test('sidebar is static on desktop and a drawer on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await signIn(page)
    await expect(page.getByRole('complementary', { name: 'Sidebar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeHidden()

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('complementary', { name: 'Sidebar' })).toBeHidden()
    await page.getByRole('button', { name: 'Open navigation' }).click()
    const drawer = page.getByRole('complementary', { name: 'Navigation drawer' })
    await expect(drawer).toBeVisible()
    await drawer.getByRole('link', { name: /Providers/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Providers' })).toBeVisible()
    await expect(drawer).toBeHidden()
  })
})

test.describe('accessibility (axe-core, WCAG 2.2 A/AA tags)', () => {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`no serious or critical violations at ${viewport.name}`, async ({ page }) => {
      test.setTimeout(240_000)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await signIn(page)
      const report: string[] = []
      const pages = [{ path: '/login' }, ...ROUTES, ...['locations', 'services', 'notifications', 'integrations', 'user-management', 'data-privacy', 'help-legal'].map((s) => ({ path: `/settings/${s}` }))]
      for (const p of pages) {
        if (p.path === '/login') continue
        await page.goto(p.path)
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
        await page.waitForTimeout(600)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
        for (const v of results.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')) {
          report.push(`${p.path} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(' ')}`)
        }
      }
      expect(report, report.join('\n')).toEqual([])
    })
  }

  test('login page has no serious or critical violations', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    const bad = results.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)
    expect(bad, bad.join('\n')).toEqual([])
  })

  test('keyboard: the skip link and tab order reach the main content', async ({ page }) => {
    await signIn(page)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main')).toBeFocused()
  })
})
