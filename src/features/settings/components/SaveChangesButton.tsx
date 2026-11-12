import { Save } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface SaveBarProps {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onCancel: () => void
  saveLabel?: string
}

export function SaveChangesButton({ dirty, saving, onSave, label = 'Save changes' }: { dirty: boolean; saving: boolean; onSave: () => void; label?: string }) {
  return (
    <Button variant="primary" icon={<Save size={16} />} onClick={onSave} disabled={!dirty || saving}>
      {saving ? 'Saving…' : label}
    </Button>
  )
}

/** Footer for form sections: unsaved-changes hint, Cancel (revert draft) and Save. */
export function SaveBar({ dirty, saving, onSave, onCancel, saveLabel }: SaveBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-line-2 bg-white px-5 py-4 shadow-card">
      <p className={`text-[14px] ${dirty ? 'font-medium text-warn' : 'text-faint'}`} role="status">
        {dirty ? 'You have unsaved changes' : 'All changes saved'}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={onCancel} disabled={!dirty || saving}>
          Cancel
        </Button>
        <SaveChangesButton dirty={dirty} saving={saving} onSave={onSave} label={saveLabel} />
      </div>
    </div>
  )
}
