import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp, signInAs } from '@/test/utils'

beforeEach(() => signInAs())

const dialog = () => screen.getByRole('dialog')
const activeCount = () => within(screen.getByText('Active services').closest('div') as HTMLElement).getByText(/^\d+$/).textContent

describe('Services section (add, edit, delete, search, toggle)', () => {
  it('lists services, filters by search and shows an empty state', async () => {
    const user = userEvent.setup()
    renderApp('/settings/services')
    expect(await screen.findByText('Annual wellness visit')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Search services' }), 'cardio')
    expect(screen.getByText('Cardiology consult')).toBeInTheDocument()
    expect(screen.queryByText('Annual wellness visit')).not.toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Search services' }))
    await user.type(screen.getByRole('textbox', { name: 'Search services' }), 'zzzz')
    expect(await screen.findByText('No services found')).toBeInTheDocument()
  })

  it('validates the add form, then creates a service', async () => {
    const user = userEvent.setup()
    renderApp('/settings/services')
    await screen.findByText('Annual wellness visit')
    await user.click(screen.getAllByRole('button', { name: 'Add service' })[0] as HTMLElement)
    await user.click(within(dialog()).getByRole('button', { name: 'Add service' }))
    expect(await within(dialog()).findByText('Service name is required')).toBeInTheDocument()
    expect(within(dialog()).getByText('Assign at least one provider')).toBeInTheDocument()

    await user.type(within(dialog()).getByLabelText('Service name'), 'Sleep study')
    await user.click(within(dialog()).getByRole('button', { name: 'Dr. Priya Patel' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Northbridge Main' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Add service' }))
    expect(await screen.findByText('Sleep study')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('deactivates a service and updates the counters', async () => {
    const user = userEvent.setup()
    renderApp('/settings/services')
    await screen.findByText('Annual wellness visit')
    const before = Number(activeCount())
    await user.click(screen.getByRole('switch', { name: 'Follow-up visit active' }))
    await waitFor(() => expect(Number(activeCount())).toBe(before - 1))
  })

  it('asks for confirmation before deleting a service', async () => {
    const user = userEvent.setup()
    renderApp('/settings/services')
    await screen.findByText('Dermatology consult')
    await user.click(screen.getByRole('button', { name: 'Delete Dermatology consult' }))
    expect(within(dialog()).getByText(/cannot be undone/)).toBeInTheDocument()
    await user.click(within(dialog()).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Dermatology consult')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Dermatology consult' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Delete service' }))
    await waitFor(() => expect(screen.queryByText('Dermatology consult')).not.toBeInTheDocument())
  })

  it('closes a dialog with Escape', async () => {
    const user = userEvent.setup()
    renderApp('/settings/services')
    await screen.findByText('Annual wellness visit')
    await user.click(screen.getAllByRole('button', { name: 'Add service' })[0] as HTMLElement)
    expect(dialog()).toHaveAttribute('aria-modal', 'true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('Locations section', () => {
  it('refuses to delete the primary location', async () => {
    const user = userEvent.setup()
    renderApp('/settings/locations')
    await screen.findByRole('button', { name: 'Delete Northbridge Main' })
    await user.click(screen.getByRole('button', { name: 'Delete Northbridge Main' }))
    expect(within(dialog()).getByText(/primary location/i)).toBeInTheDocument()
    await user.click(within(dialog()).getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('button', { name: 'Delete Northbridge Main' })).toBeInTheDocument()
  })

  it('shows validation errors in the add-location form', async () => {
    const user = userEvent.setup()
    renderApp('/settings/locations')
    await screen.findByRole('button', { name: 'Delete Northbridge Main' })
    await user.click(screen.getByRole('button', { name: 'Add location' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Add location' }))
    expect(await within(dialog()).findByText('Location name is required')).toBeInTheDocument()
    expect(within(dialog()).getByText('Enter a valid phone number')).toBeInTheDocument()
  })
})

describe('User management section', () => {
  it('validates and sends an invitation, then filters by status', async () => {
    const user = userEvent.setup()
    renderApp('/settings/user-management')
    await screen.findByText('Sarah Williams')
    await user.click(screen.getByRole('button', { name: 'Invite user' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Send invitation' }))
    expect(await within(dialog()).findByText('Full name is required')).toBeInTheDocument()
    expect(within(dialog()).getByText('Enter a valid email address')).toBeInTheDocument()

    await user.type(within(dialog()).getByLabelText('Full name'), 'Jordan Lee')
    await user.type(within(dialog()).getByLabelText('Email'), 'jordan.lee@example.com')
    await user.click(within(dialog()).getByRole('button', { name: 'Northbridge Main' }))
    await user.click(within(dialog()).getByRole('button', { name: 'Send invitation' }))
    expect(await screen.findByText('Jordan Lee')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Invited')
    expect(screen.getByText('Jordan Lee')).toBeInTheDocument()
    expect(screen.queryByText('Ethan Cole')).not.toBeInTheDocument()
  })
})

describe('Integrations section', () => {
  it('requires an API key to connect and confirms before disconnecting', async () => {
    const user = userEvent.setup()
    renderApp('/settings/integrations')
    await screen.findByText('Stripe')
    await user.click(screen.getAllByRole('button', { name: 'Connect' })[0] as HTMLElement)
    await user.click(within(dialog()).getByRole('button', { name: 'Connect (demo)' }))
    expect(await within(dialog()).findByText(/at least 8 characters/)).toBeInTheDocument()
    await user.click(within(dialog()).getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getAllByRole('button', { name: 'Disconnect' })[0] as HTMLElement)
    expect(within(dialog()).getByText(/stop syncing/)).toBeInTheDocument()
  })

  it('labels connections as demo instead of claiming real ones', async () => {
    renderApp('/settings/integrations')
    expect(await screen.findAllByText('Connected (demo)')).not.toHaveLength(0)
    expect(screen.getByRole('note')).toHaveTextContent(/does not verify credentials/i)
  })
})

describe('Clinic profile form', () => {
  it('shows validation errors and keeps Save disabled until something changes', async () => {
    const user = userEvent.setup()
    renderApp('/settings/clinic-profile')
    const npi = await screen.findByLabelText('Organization NPI')
    expect(screen.getAllByRole('button', { name: 'Save changes' })[0]).toBeDisabled()
    await user.clear(npi)
    await user.type(npi, '123')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('NPI must be exactly 10 digits')).toBeInTheDocument()
  })

  it('rejects unsupported logo files', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderApp('/settings/clinic-profile')
    const input = (await screen.findByLabelText('Upload clinic logo')) as HTMLInputElement
    await user.upload(input, new File(['x'], 'notes.pdf', { type: 'application/pdf' }))
    expect(await screen.findByText('Use a PNG, JPG, WebP or SVG image')).toBeInTheDocument()
  })

  it('warns before leaving with unsaved changes and lets the user stay', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/settings/clinic-profile')
    const name = await screen.findByLabelText('Clinic name')
    await user.type(name, ' Group')
    await user.click(within(screen.getByRole('navigation', { name: 'Settings sections' })).getByRole('link', { name: /Locations/ }))
    expect(await screen.findByRole('heading', { name: 'Discard unsaved changes?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(router.state.location.pathname).toBe('/settings/clinic-profile')
    expect(screen.getByLabelText('Clinic name')).toHaveValue('Northstar Clinic Group')
  })

  it('saves valid changes and clears the unsaved state', async () => {
    const user = userEvent.setup()
    renderApp('/settings/clinic-profile')
    await user.type(await screen.findByLabelText('Clinic name'), ' Group')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('All changes saved')).toBeInTheDocument()
  })
})
