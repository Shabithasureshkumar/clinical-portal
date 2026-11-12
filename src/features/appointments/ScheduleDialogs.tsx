import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { TextField } from '@/components/forms/Fields'
import { FormDialog } from '@/components/forms/FormDialog'
import { SelectField } from '@/components/forms/SelectFields'
import { useZodForm } from '@/hooks/useZodForm'
import { formatTimeLabel } from './AddAppointmentModal'

const reassignSchema = z.object({ provider: z.string().min(1, 'Select a provider') })
const rescheduleSchema = z.object({ time: z.string().min(1, 'Choose a new time') })

interface ReassignDialogProps {
  open: boolean
  count: number
  providers: string[]
  onClose: () => void
  onSubmit: (provider: string) => void
}

export function ReassignDialog({ open, count, providers, onClose, onSubmit }: ReassignDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useZodForm(reassignSchema, { defaultValues: { provider: providers[0] ?? '' } })
  useEffect(() => {
    if (open) reset({ provider: providers[0] ?? '' })
  }, [open, providers, reset])
  const submit = handleSubmit((v) => {
    onSubmit(v.provider)
    onClose()
  })
  return (
    <FormDialog open={open} title="Reassign appointments" description={`Move ${count} appointment${count === 1 ? '' : 's'} to another provider.`} submitLabel="Reassign" onClose={onClose} onSubmit={submit}>
      <Controller control={control} name="provider" render={({ field }) => <SelectField label="New provider" options={providers} value={field.value} onChange={field.onChange} error={errors.provider?.message} />} />
    </FormDialog>
  )
}

interface RescheduleDialogProps {
  open: boolean
  count: number
  onClose: () => void
  onSubmit: (timeLabel: string) => void
}

export function RescheduleDialog({ open, count, onClose, onSubmit }: RescheduleDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useZodForm(rescheduleSchema, { defaultValues: { time: '' } })
  useEffect(() => {
    if (open) reset({ time: '' })
  }, [open, reset])
  const submit = handleSubmit((v) => {
    onSubmit(formatTimeLabel(v.time))
    onClose()
  })
  return (
    <FormDialog open={open} title="Reschedule appointments" description={`Set a new start time for ${count} appointment${count === 1 ? '' : 's'}.`} submitLabel="Reschedule" onClose={onClose} onSubmit={submit}>
      <TextField label="New time" type="time" error={errors.time?.message} {...register('time')} />
    </FormDialog>
  )
}
