import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { SelectField } from '@/components/forms/SelectFields'
import { useZodForm } from '@/hooks/useZodForm'
import { appointmentSchema, type AppointmentFormValues } from '@/schemas/common'

export const formatTimeLabel = (time: string): string => {
  const [h, m] = time.split(':').map(Number) as [number, number]
  return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

interface AddAppointmentModalProps {
  open: boolean
  providers: string[]
  onClose: () => void
  onSubmit: (values: AppointmentFormValues & { timeLabel: string }) => void | Promise<void>
}

/** Add-appointment dialog (react-hook-form + Zod). Shared by Home and Clinic Schedule. */
export function AddAppointmentModal({ open, providers, onClose, onSubmit }: AddAppointmentModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(appointmentSchema, { defaultValues: { patient: '', provider: providers[0] ?? '', visitType: 'In-Person', time: '' } })

  useEffect(() => {
    if (open) reset({ patient: '', provider: providers[0] ?? '', visitType: 'In-Person', time: '' })
  }, [open, providers, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, timeLabel: formatTimeLabel(values.time) })
    onClose()
  })

  return (
    <FormDialog open={open} title="Add appointment" description="Book a new appointment into today's schedule (demo data, not saved to a server)." submitLabel="Book appointment" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextField label="Patient name" placeholder="e.g. Jordan Smith" error={errors.patient?.message} {...register('patient')} />
      <Controller control={control} name="provider" render={({ field }) => <SelectField label="Provider" options={providers} value={field.value} onChange={field.onChange} error={errors.provider?.message} />} />
      <Controller control={control} name="visitType" render={({ field }) => <SelectField label="Visit type" options={['In-Person', 'Video Visit', 'Phone Call']} value={field.value} onChange={field.onChange} />} />
      <TextField label="Time" type="time" error={errors.time?.message} {...register('time')} />
    </FormDialog>
  )
}
