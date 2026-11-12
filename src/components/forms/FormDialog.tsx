import { useId, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

interface FormDialogProps {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  busy?: boolean
  size?: 'md' | 'lg'
  onClose: () => void
  /** Receives the submit event; pass react-hook-form's handleSubmit(...) result. */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

/** Modal wrapping a form with Cancel / Submit actions and a busy state. */
export function FormDialog({ open, title, description, submitLabel, busy, size = 'md', onClose, onSubmit, children }: FormDialogProps) {
  const formId = useId()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form={formId} disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
        {children}
      </form>
    </Modal>
  )
}
