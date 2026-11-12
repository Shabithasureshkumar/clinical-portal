import { AtSign, Globe, Phone, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { LogoMark } from '@/components/common/Logo'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/common/Toast'
import { useSettingsForm, type FormErrors } from '@/hooks/useSettingsForm'
import { settingsApi } from '@/services/settingsService'
import type { ClinicProfile as ClinicProfileData } from '@/types'
import { isEmail, isNpi, isPhone, isUrlLike } from '@/utils/validation'
import { SaveBar } from '../components/SaveChangesButton'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'
import { FormGrid, TextAreaField, TextField } from '../components/SettingsFormField'

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const DESC_MAX = 500

const validate = (p: ClinicProfileData): FormErrors => {
  const e: FormErrors = {}
  if (p.name.trim().length < 2) e.name = 'Clinic name is required'
  if (!p.specialties.trim()) e.specialties = 'Add at least one specialty'
  if (p.website.trim() && !isUrlLike(p.website)) e.website = 'Enter a valid website, e.g. clinic.com'
  if (!isPhone(p.phone)) e.phone = 'Enter a valid phone number'
  if (!isEmail(p.email)) e.email = 'Enter a valid email address'
  if (!isNpi(p.npi)) e.npi = 'NPI must be exactly 10 digits'
  if (p.description.length > DESC_MAX) e.description = `Keep the description under ${DESC_MAX} characters`
  return e
}

export default function ClinicProfile() {
  const form = useSettingsForm(settingsApi.profile, validate)
  const notify = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoError, setLogoError] = useState('')
  const { draft, patch, errors } = form

  const onFile = (file: File | undefined) => {
    if (!file) return
    setLogoError('')
    if (!LOGO_TYPES.includes(file.type)) return setLogoError('Use a PNG, JPG, WebP or SVG image')
    if (file.size > MAX_LOGO_BYTES) return setLogoError('Logo must be 2 MB or smaller')
    const reader = new FileReader()
    reader.addEventListener('load', () => patch({ logoDataUrl: String(reader.result) }))
    reader.addEventListener('error', () => notify('Could not read that file'))
    reader.readAsDataURL(file)
  }

  return (
    <SectionState loading={form.loading} error={form.loadError} onRetry={form.reload}>
      {draft && (
        <div className="space-y-5">
          <SettingsCard id="profile" title="Clinic profile" subtitle="Your clinic identity and public details">
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <span className="flex h-[83px] w-[85px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-linear-to-br from-[#0a1d2c] to-[#0f3a4a]">
                {draft.logoDataUrl ? <img src={draft.logoDataUrl} alt="Clinic logo preview" className="h-full w-full object-cover" /> : <LogoMark size={52} />}
              </span>
              <div>
                <p className="text-[16px] font-bold text-ink">Clinic logo</p>
                <p className="mt-1 text-[13.5px] text-faint">Shown across your patient communications. PNG, JPG, WebP or SVG up to 2 MB.</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                  <input ref={fileRef} type="file" accept={LOGO_TYPES.join(',')} className="sr-only" aria-label="Upload clinic logo" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
                  <Button size="sm" className="!h-[36px] !rounded-[10px] !text-[13px]" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
                    {draft.logoDataUrl ? 'Replace logo' : 'Upload logo'}
                  </Button>
                  {draft.logoDataUrl && (
                    <Button size="sm" variant="ghost" className="!h-[36px] !text-[13px]" icon={<Trash2 size={13} />} onClick={() => patch({ logoDataUrl: null })}>
                      Remove
                    </Button>
                  )}
                </div>
                {logoError && <p role="alert" className="mt-2 text-[13px] text-bad">{logoError}</p>}
              </div>
            </div>

            <div className="mt-8">
              <FormGrid>
                <TextField label="Clinic name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} />
                <TextField label="Specialties" value={draft.specialties} onChange={(e) => patch({ specialties: e.target.value })} error={errors.specialties} placeholder="Comma separated" />
                <TextField label="Website" leading={<Globe size={15} />} value={draft.website} onChange={(e) => patch({ website: e.target.value })} error={errors.website} />
                <TextField label="Phone" leading={<Phone size={15} />} value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} error={errors.phone} />
                <TextField label="Email" leading={<AtSign size={15} />} type="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} error={errors.email} />
                <TextField label="Organization NPI" inputMode="numeric" value={draft.npi} onChange={(e) => patch({ npi: e.target.value })} error={errors.npi} />
              </FormGrid>
              <div className="mt-5">
                <TextAreaField label="Clinic description" value={draft.description} onChange={(e) => patch({ description: e.target.value })} error={errors.description} placeholder="Tell patients what makes your clinic different" />
                <p className="mt-1.5 text-right text-[12.5px] text-faint">{draft.description.length}/{DESC_MAX}</p>
              </div>
            </div>
          </SettingsCard>
          <SaveBar dirty={form.dirty} saving={form.saving} onSave={form.save} onCancel={form.reset} />
        </div>
      )}
    </SectionState>
  )
}
