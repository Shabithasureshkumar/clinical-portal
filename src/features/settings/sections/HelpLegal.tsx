import { BookOpen, ChevronDown, Copy, ExternalLink, FileText, LifeBuoy, Mail, Phone, Search, ShieldCheck, Cookie, Activity } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/States'
import { useToast } from '@/components/common/Toast'
import { SUPPORT } from '@/constants/settings'
import { useAsync } from '@/hooks/useAsync'
import { settingsApi } from '@/services/settingsService'
import { cn } from '@/utils/cn'
import { SectionState } from '../components/SectionState'
import { SettingsCard } from '../components/SettingsCard'

function ResourceLink({ icon, title, description, href, envName, kind = 'external' }: { icon: ReactNode; title: string; description: string; href: string; envName: string; kind?: 'external' | 'mail' | 'tel' }) {
  const configured = href.trim().length > 0
  const target = kind === 'mail' ? `mailto:${href}` : kind === 'tel' ? `tel:${href.replace(/[^\d+]/g, '')}` : href
  const body = (
    <>
      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] bg-brand-50 text-brand-600">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-ink">{title}</span>
        <span className="mt-0.5 block truncate text-[13px] text-faint">{configured ? (kind === 'external' ? description : href) : `Not configured · set ${envName}`}</span>
      </span>
      {configured && kind === 'external' && <ExternalLink size={15} className="shrink-0 text-brand-600" />}
    </>
  )
  const base = 'flex min-w-0 items-center gap-4 rounded-[16px] border border-line-2 bg-white p-[17px] shadow-soft'
  return configured ? (
    <a href={target} {...(kind === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cn(base, 'transition hover:bg-tint')}>
      {body}
    </a>
  ) : (
    <div className={cn(base, 'opacity-60')} aria-disabled="true">
      {body}
    </div>
  )
}

export default function HelpLegal() {
  const faq = useAsync(settingsApi.faq.list)
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)

  const topics = useMemo(() => ['All', ...new Set((faq.data ?? []).map((f) => f.topic))], [faq.data])
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (faq.data ?? []).filter((f) => (topic === 'All' || f.topic === topic) && (!q || `${f.question} ${f.answer}`.toLowerCase().includes(q)))
  }, [faq.data, query, topic])

  const copyDiagnostics = async () => {
    const info = `Mednevo portal v${SUPPORT.appVersion}\nBrowser: ${navigator.userAgent}\nTime: ${new Date().toISOString()}`
    try {
      await navigator.clipboard.writeText(info)
      notify('Diagnostic info copied')
    } catch {
      notify('Could not access the clipboard')
    }
  }

  return (
    <SectionState loading={faq.loading} error={faq.error} onRetry={faq.reload}>
      <div className="space-y-5">
        <SettingsCard title="Help & legal" subtitle="Support resources, documentation and legal documents">
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ResourceLink icon={<BookOpen size={19} />} title="Help center & documentation" description="Guides and user documentation" href={SUPPORT.docsUrl} envName="VITE_DOCS_URL" />
            <ResourceLink icon={<Activity size={19} />} title="Service status" description="Current system status" href={SUPPORT.statusUrl} envName="VITE_STATUS_URL" />
          </div>
        </SettingsCard>

        <SettingsCard title="Contact support" subtitle="Reach our team for product or technical help">
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ResourceLink icon={<Mail size={19} />} title="Email support" description="" href={SUPPORT.email} envName="VITE_SUPPORT_EMAIL" kind="mail" />
            <ResourceLink icon={<Phone size={19} />} title="Technical support line" description="" href={SUPPORT.phone} envName="VITE_SUPPORT_PHONE" kind="tel" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[14px] border border-line-2 bg-tint px-4 py-3">
            <LifeBuoy size={18} className="text-brand-600" />
            <p className="flex-1 text-[13.5px] text-muted">When contacting technical support, include your software version and browser details.</p>
            <Button size="sm" icon={<Copy size={13} />} className="!h-[36px] !text-[13px]" onClick={copyDiagnostics}>Copy diagnostic info</Button>
          </div>
        </SettingsCard>

        <SettingsCard title="Frequently asked questions" subtitle="Quick answers to common questions">
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="flex h-[48px] min-w-[220px] flex-1 items-center gap-3 rounded-[12px] border border-line bg-white px-4 sm:max-w-[380px]">
              <Search size={15} className="text-ink-2" />
              <span className="sr-only">Search FAQs</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={cn('h-[38px] rounded-full border px-4 text-[13px] font-medium transition', topic === t ? 'border-transparent bg-linear-to-b from-[#22d0ee] to-[#0cbfe3] text-white shadow-brand' : 'border-line bg-white text-ink-2 hover:bg-tint')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-5 divide-y divide-line-2 overflow-hidden rounded-[16px] border border-line-2">
            {rows.length === 0 && <li><EmptyState title="No questions match" description="Try different words or another topic." /></li>}
            {rows.map((f) => {
              const open = openId === f.id
              return (
                <li key={f.id}>
                  <h3>
                    <button type="button" aria-expanded={open} aria-controls={`faq-${f.id}`} onClick={() => setOpenId(open ? null : f.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-tint">
                      <span className="flex-1 text-[15px] font-semibold text-ink">{f.question}</span>
                      <Badge tone="neutral" size="sm">{f.topic}</Badge>
                      <ChevronDown size={16} className={cn('shrink-0 transition', open && 'rotate-180')} />
                    </button>
                  </h3>
                  {open && <p id={`faq-${f.id}`} className="px-5 pb-5 text-[14.5px] leading-6 text-muted">{f.answer}</p>}
                </li>
              )
            })}
          </ul>
        </SettingsCard>

        <SettingsCard title="Legal" subtitle="Documents that govern use of the portal">
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ResourceLink icon={<FileText size={19} />} title="Terms and conditions" description="Open in a new tab" href={SUPPORT.termsUrl} envName="VITE_TERMS_URL" />
            <ResourceLink icon={<ShieldCheck size={19} />} title="Privacy policy" description="Open in a new tab" href={SUPPORT.privacyUrl} envName="VITE_PRIVACY_URL" />
            <ResourceLink icon={<Cookie size={19} />} title="Cookie policy" description="Open in a new tab" href={SUPPORT.cookieUrl} envName="VITE_COOKIE_URL" />
          </div>
          <dl className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-line-2 pt-5 text-[14px]">
            <div className="flex items-center gap-3">
              <dt className="text-muted">Software version</dt>
              <dd className="font-bold text-ink">{SUPPORT.appVersion}</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-muted">Environment</dt>
              <dd><Badge tone="info" size="sm">{import.meta.env.MODE}</Badge></dd>
            </div>
          </dl>
        </SettingsCard>
      </div>
    </SectionState>
  )
}
