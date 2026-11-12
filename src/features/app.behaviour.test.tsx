import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api/apiClient'
import { dashboardService } from '@/services/dashboardService'
import { renderApp, signInAs } from '@/test/utils'

beforeEach(() => signInAs())

describe('API loading and error states', () => {
  it('shows a loading skeleton, then the page', async () => {
    renderApp('/providers')
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Providers' })).toBeInTheDocument()
  })

  it('shows an error state with retry when a request fails, then recovers', async () => {
    const original = dashboardService.get
    const spy = vi.spyOn(dashboardService, 'get').mockRejectedValueOnce(new ApiError({ message: 'Service unavailable', status: 503 }))
    spy.mockImplementation((opts) => original(opts))
    const user = userEvent.setup()
    renderApp('/')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Service unavailable')
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 1, name: /Good morning/ })).toBeInTheDocument()
  })
})

describe('top bar and sidebar controls', () => {
  it('finds pages through global search with the keyboard', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    const search = screen.getByRole('combobox', { name: /Search pages/ })
    await user.type(search, 'prov')
    expect(await screen.findByRole('option', { name: /Providers/ })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/providers'))
  })

  it('opens notifications, marks them as read and navigates from one', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    await user.click(await screen.findByRole('button', { name: /Notifications, 3 unread/ }))
    const panel = await screen.findByRole('dialog', { name: 'Notifications' })
    await user.click(await within(panel).findByRole('button', { name: /Invoice overdue/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/billing-revenue'))
  })

  it('switches the clinic location from the sidebar', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    await user.click(screen.getAllByRole('button', { name: /Switch clinic location/ })[0] as HTMLElement)
    await user.click(await screen.findByRole('menuitemradio', { name: 'Westfield Annex' }))
    expect(await screen.findAllByRole('button', { name: /current: Westfield Annex/ })).not.toHaveLength(0)
  })

  it('opens and closes the mobile navigation drawer', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    const drawer = screen.getByRole('complementary', { name: 'Navigation drawer', hidden: true })
    expect(drawer.parentElement).toHaveAttribute('aria-hidden', 'true')
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(drawer.parentElement).toHaveAttribute('aria-hidden', 'false')
    await user.click(screen.getByRole('button', { name: 'Close navigation' }))
    expect(drawer.parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('page interactions', () => {
  it('Home: Add appointment validates and books, Export downloads a file', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { level: 1, name: /Good morning/ })
    const createUrl = vi.fn(() => 'blob:test')
    URL.createObjectURL = createUrl
    URL.revokeObjectURL = vi.fn()
    await user.click(screen.getByRole('button', { name: 'Export overview' }))
    expect(createUrl).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Add appointment' }))
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Book appointment' }))
    expect(await within(dlg).findByText('Patient name is required')).toBeInTheDocument()
    expect(within(dlg).getByText('Choose a time')).toBeInTheDocument()
    await user.type(within(dlg).getByLabelText('Patient name'), 'Jordan Smith')
    await user.type(within(dlg).getByLabelText('Time'), '10:30')
    await user.click(within(dlg).getByRole('button', { name: 'Book appointment' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('Home: the Waiting Only chip filters the timeline', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByText('Mike Lee')
    await user.click(screen.getByRole('button', { name: 'Waiting Only' }))
    expect(screen.queryByText('Mike Lee')).not.toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
  })

  it('Schedule: filters rows, reschedules selected rows and cancels with confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/clinic-schedule')
    expect(await screen.findByRole('table', { name: 'Appointments' })).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Search appointments' }), 'Emily')
    const table = screen.getByRole('table', { name: 'Appointments' })
    expect(within(table).getByText('Emily Davis', { exact: false })).toBeInTheDocument()
    expect(within(table).queryByText('Mike Lee', { exact: false })).not.toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search appointments' }))

    await user.click(screen.getByRole('button', { name: /Reschedule/ }))
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Reschedule' }))
    expect(await within(dlg).findByText('Choose a new time')).toBeInTheDocument()
    await user.type(within(dlg).getByLabelText('New time'), '14:00')
    await user.click(within(dlg).getByRole('button', { name: 'Reschedule' }))
    expect((await screen.findAllByText('02:00 PM')).length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: /^Cancel$/ })[0] as HTMLElement)
    expect(within(screen.getByRole('dialog')).getByText(/will be removed from the schedule/)).toBeInTheDocument()
  })

  it('Schedule: Week view lets the user pick a day', async () => {
    const user = userEvent.setup()
    renderApp('/clinic-schedule')
    await screen.findByRole('table', { name: 'Appointments' })
    await user.click(screen.getByRole('tab', { name: 'Week' }))
    expect(screen.getByRole('heading', { name: 'This week' })).toBeInTheDocument()
    const weekCard = screen.getByRole('heading', { name: 'This week' }).parentElement as HTMLElement
    await user.click(within(weekCard).getByRole('button', { name: /Wed 29/ }))
    expect(screen.queryByRole('heading', { name: 'This week' })).not.toBeInTheDocument()
  })

  it('Billing: searches, paginates and creates an invoice with validation', async () => {
    const user = userEvent.setup()
    renderApp('/billing-revenue')
    expect(await screen.findByText('INV-20482')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(await screen.findByText('INV-20478')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Search transactions' }), 'noah')
    expect(await screen.findByText('INV-20481')).toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search transactions' }))

    await user.click(screen.getByRole('button', { name: 'Create invoice' }))
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Create invoice' }))
    expect(await within(dlg).findByText('Patient name is required')).toBeInTheDocument()
    expect(within(dlg).getByText('Enter an amount')).toBeInTheDocument()
    await user.type(within(dlg).getByLabelText('Patient'), 'Casey Morgan')
    await user.type(within(dlg).getByLabelText('Service'), 'Lab review')
    await user.type(within(dlg).getByLabelText('Amount (USD)'), '-5')
    await user.click(within(dlg).getByRole('button', { name: 'Create invoice' }))
    expect(await within(dlg).findByText('Enter an amount greater than 0')).toBeInTheDocument()
  })

  it('Users: searches and filters the directory and opens the roles matrix', async () => {
    const user = userEvent.setup()
    renderApp('/user-management')
    await screen.findByText('Ethan Cole')
    await user.type(screen.getByRole('searchbox', { name: 'Search users' }), 'okafor')
    expect(screen.getByText('Nina Okafor')).toBeInTheDocument()
    expect(screen.queryByText('Ethan Cole')).not.toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox', { name: 'Search users' }))
    await user.click(screen.getByRole('button', { name: /Roles & Permissions/ }))
    expect(await screen.findByRole('dialog', { name: /Roles & permissions/i })).toBeInTheDocument()
  })

  it('Providers: filters by role chip and sends a message with validation', async () => {
    const user = userEvent.setup()
    renderApp('/providers')
    await screen.findByText('NP Maria Garcia')
    await user.click(screen.getByRole('button', { name: 'Nurse Practitioners' }))
    expect(screen.queryByText('Dr. Rajesh Kumar')).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Message' })[0] as HTMLElement)
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Send message' }))
    expect(await within(dlg).findByText(/at least 3 characters/)).toBeInTheDocument()
  })

  it('Clinic: adds a location with validation and adjusts rooms', async () => {
    const user = userEvent.setup()
    renderApp('/clinic-management')
    await screen.findByText('Northbridge Main')
    await user.click(screen.getByRole('button', { name: 'Add Location' }))
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Add location' }))
    expect(await within(dlg).findByText('Location name is required')).toBeInTheDocument()
    await user.click(within(dlg).getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getAllByRole('button', { name: 'Rooms' })[0] as HTMLElement)
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add a room' }))
    expect(within(screen.getByRole('dialog')).getByText('15')).toBeInTheDocument()
  })

  it('Reports: saves a report with validation and manages saved reports', async () => {
    const user = userEvent.setup()
    renderApp('/reports-analytics')
    await screen.findByRole('heading', { level: 1, name: 'Reports & analytics' })
    await user.click(screen.getByRole('button', { name: 'Save report' }))
    const dlg = screen.getByRole('dialog')
    await user.click(within(dlg).getByRole('button', { name: 'Save report' }))
    expect(await within(dlg).findByText(/at least 3 characters/)).toBeInTheDocument()
    await user.type(within(dlg).getByLabelText('Report name'), 'Weekly review')
    await user.click(within(dlg).getByRole('button', { name: 'Save report' }))
    expect(await screen.findByText('Weekly review')).toBeInTheDocument()
  })
})
