import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/utils'

describe('Login page', () => {
  it('redirects unauthenticated visitors to the sign-in page and shows the demo notice', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/demo mode/i)
  })

  it('shows required-field messages on an empty submit', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('rejects an invalid email and a short password', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await user.type(await screen.findByLabelText('Email'), 'nope')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('signs in, shows a loading state and lands on Home', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await user.type(await screen.findByLabelText('Email'), 'sarah.williams@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
    expect(await screen.findByRole('heading', { level: 1, name: /Good morning/ })).toBeInTheDocument()
  })

  it('returns the user to the page they originally requested after signing in', async () => {
    const user = userEvent.setup()
    renderApp('/providers')
    await user.type(await screen.findByLabelText('Email'), 'sarah.williams@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Providers' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument())
  })
})
