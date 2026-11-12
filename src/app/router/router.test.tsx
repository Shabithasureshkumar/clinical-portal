import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SETTINGS_SECTIONS } from '@/constants/settings'
import { renderApp, signInAs } from '@/test/utils'

const sidebar = () => screen.getByRole('navigation', { name: 'Primary' })

describe('routing and access control', () => {
  it('sends signed-in users away from /login', async () => {
    signInAs()
    renderApp('/login')
    expect(await screen.findByRole('heading', { level: 1, name: /Good morning/ })).toBeInTheDocument()
  })

  it('shows a 404 page for unknown routes', async () => {
    signInAs()
    renderApp('/this-page-does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/')
  })

  it('blocks roles that lack access and hides their navigation items', async () => {
    signInAs('Nurse')
    renderApp('/settings')
    expect(await screen.findByRole('heading', { name: 'You do not have access' })).toBeInTheDocument()
    const nav = within(sidebar())
    expect(nav.queryByRole('link', { name: /Settings/ })).not.toBeInTheDocument()
    expect(nav.queryByRole('link', { name: /Billing/ })).not.toBeInTheDocument()
    expect(nav.getByRole('link', { name: /Providers/ })).toBeInTheDocument()
  })

  it('allows billing staff into billing but not user management', async () => {
    signInAs('Billing staff')
    const { router } = renderApp('/billing-revenue')
    expect(await screen.findByRole('heading', { level: 1, name: /Billing/ })).toBeInTheDocument()
    await router.navigate('/user-management')
    expect(await screen.findByRole('heading', { name: 'You do not have access' })).toBeInTheDocument()
  })
})

describe('sidebar navigation', () => {
  it('navigates between pages and marks the active item', async () => {
    signInAs()
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })

    const targets: [RegExp, string][] = [
      [/Clinic Schedule/, 'Clinic Schedule'],
      [/Providers/, 'Providers'],
      [/Billing & Revenue/, 'Billing & revenue'],
      [/Reports & Analytics/, 'Reports & analytics'],
      [/User Management/, 'User Management'],
      [/Clinic Management/, 'Clinic Management'],
    ]
    for (const [link, heading] of targets) {
      await user.click(within(sidebar()).getByRole('link', { name: link }))
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
      expect(within(sidebar()).getByRole('link', { name: link })).toHaveAttribute('aria-current', 'page')
    }
  })

  it('supports browser back and forward navigation', async () => {
    signInAs()
    const user = userEvent.setup()
    const { router } = renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    await user.click(within(sidebar()).getByRole('link', { name: /Providers/ }))
    await screen.findByRole('heading', { level: 1, name: 'Providers' })
    await router.navigate(-1)
    expect(await screen.findByRole('heading', { level: 1, name: /Good morning/ })).toBeInTheDocument()
    await router.navigate(1)
    expect(await screen.findByRole('heading', { level: 1, name: 'Providers' })).toBeInTheDocument()
  })

  it('signs out from the account menu', async () => {
    signInAs()
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    await user.click(screen.getAllByRole('button', { name: 'Account menu' })[0] as HTMLElement)
    await user.click(await screen.findByRole('menuitem', { name: /Sign out/ }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})

describe('settings submenu', () => {
  it('redirects /settings to the first section', async () => {
    signInAs()
    renderApp('/settings')
    expect(await screen.findByRole('heading', { level: 2, name: 'Clinic profile' })).toBeInTheDocument()
  })

  it.each(SETTINGS_SECTIONS.map((s) => [s.label, s.title] as const))('opens the "%s" section with its own heading', async (label, title) => {
    signInAs()
    const user = userEvent.setup()
    renderApp('/settings')
    await screen.findByRole('heading', { level: 2, name: 'Clinic profile' })
    const nav = screen.getByRole('navigation', { name: 'Settings sections' })
    await user.click(within(nav).getByRole('link', { name: new RegExp(label, 'i') }))
    expect((await screen.findAllByRole('heading', { level: 2, name: title })).length).toBeGreaterThan(0)
    expect(within(screen.getByRole('navigation', { name: 'Settings sections' })).getByRole('link', { name: new RegExp(label, 'i') })).toHaveAttribute('aria-current', 'page')
  })

  it('falls back to the first section for an unknown section id', async () => {
    signInAs()
    renderApp('/settings/not-a-section')
    expect(await screen.findByRole('heading', { level: 2, name: 'Clinic profile' })).toBeInTheDocument()
  })
})
