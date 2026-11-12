import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { TextField } from '@/components/forms/Fields'
import { SelectField } from '@/components/forms/SelectFields'
import { ROUTES } from '@/constants/routes'
import { useZodForm } from '@/hooks/useZodForm'
import { AUTH_ROLES, loginSchema } from '@/schemas/auth'
import { normalizeError } from '@/services/api/apiClient'
import { AUTH_IS_DEMO } from '@/services/auth/authService'
import { useAuth } from '@/store/authStore'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home
  const [formError, setFormError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema, { defaultValues: { email: '', password: '', demoRole: 'Clinic administrator' } })

  const onSubmit = handleSubmit(async (values) => {
    setFormError('')
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (e) {
      setFormError(normalizeError(e).message)
    }
  })

  return (
    <Card className="rounded-[22px] p-7 sm:p-9">
      <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Sign in</h1>
      <p className="mt-2 text-[15px] text-muted">Use your clinic account to continue.</p>

      {AUTH_IS_DEMO && (
        <p role="note" className="mt-5 rounded-[12px] border border-[#fde0a8] bg-[#fffaf0] px-4 py-3 text-[13px] leading-5 text-[#8a5a00]">
          <strong>Demo mode.</strong> No real authentication happens. Any well-formed email and a password of 8+ characters will sign you in.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5" aria-describedby={formError ? 'login-error' : undefined}>
        <TextField label="Email" type="email" autoComplete="username" placeholder="you@clinic.com" error={errors.email?.message} {...register('email')} />
        <TextField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Controller
          control={control}
          name="demoRole"
          render={({ field }) => (
            <SelectField label="Demo role" options={AUTH_ROLES} value={field.value} onChange={field.onChange} hint="Demo only: roles come from the backend in production." />
          )}
        />
        {formError && (
          <p id="login-error" role="alert" className="rounded-[10px] bg-bad-bg px-4 py-3 text-[14px] text-bad">
            {formError}
          </p>
        )}
        <Button type="submit" variant="primary" fullWidth icon={<LogIn size={17} />} disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  )
}
