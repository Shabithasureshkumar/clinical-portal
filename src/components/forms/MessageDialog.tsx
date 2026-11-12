import { useEffect } from 'react'
import { TextAreaField } from '@/components/forms/Fields'
import { useToast } from '@/components/common/Toast'
import { useZodForm } from '@/hooks/useZodForm'
import { messageSchema } from '@/schemas/common'
import { FormDialog } from './FormDialog'

interface MessageDialogProps {
  open: boolean
  recipient: string
  onClose: () => void
}

/** Compose-message dialog. Delivery is simulated: no backend messaging API exists yet. */
export function MessageDialog({ open, recipient, onClose }: MessageDialogProps) {
  const notify = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(messageSchema, { defaultValues: { body: '' } })

  useEffect(() => {
    if (open) reset({ body: '' })
  }, [open, reset])

  const submit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400))
    notify(`Message to ${recipient} queued (demo: not delivered)`)
    onClose()
  })

  return (
    <FormDialog open={open} title={`Message ${recipient}`} description="Demo only: messages are not delivered until a messaging backend is connected." submitLabel="Send message" busy={isSubmitting} onClose={onClose} onSubmit={submit}>
      <TextAreaField label="Message" error={errors.body?.message} {...register('body')} />
    </FormDialog>
  )
}
