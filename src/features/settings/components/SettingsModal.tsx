import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

interface SettingsModalProps {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  busy?: boolean
  size?: 'md' | 'lg'
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}

/** Reusable add/edit dialog: validation lives in the caller, which decides when onSubmit may run. */
export function SettingsModal({ open, title, description, submitLabel, busy, size = 'md', onClose, onSubmit, children }: SettingsModalProps) {
  const formId = `settings-form-${title.replace(/\W+/g, '-').toLowerCase()}`
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }
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
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {children}
      </form>
    </Modal>
  )
}
