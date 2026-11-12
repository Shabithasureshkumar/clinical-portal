import { useId, useState } from 'react'
import { portraitFor } from '@/constants/avatars'
import { cn } from '@/utils/cn'

const SKINS = ['#f3d2b5', '#e8b88f', '#d49a6a', '#b9774a', '#8d5a3b', '#6b4430']
const HAIRS = ['#1f1a17', '#3b2a20', '#5a3b25', '#8a6a3f', '#c9b07a', '#2d2d34']
const BACKGROUNDS: [string, string][] = [
  ['#e4f9fd', '#aeeef9'],
  ['#eceefd', '#c8cff7'],
  ['#e5f8ee', '#bdebd3'],
  ['#fff0dc', '#ffd3a6'],
  ['#f6e8fc', '#e0c3f3'],
  ['#e6f3fc', '#bcdcf3'],
]
const SCRUBS = ['#15c8e9', '#5b7cf0', '#10b981', '#7c6cf0']

const hash = (value: string): number => {
  let h = 7
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const isClinician = (name: string): boolean => /^(dr\.?|np)\s/i.test(name.trim())

interface UserPhotoProps {
  name: string
  size?: number
  /** Real photo URL; defaults to the demo portrait assigned to this name, then the drawn fallback. */
  photoUrl?: string | null
  shape?: 'circle' | 'rounded'
  /** Optional status dot colour shown at the bottom-right corner. */
  status?: string
  className?: string
}

/**
 * Profile photo. Shows `photoUrl` when available; otherwise draws a stable,
 * name-based portrait so every person has a recognisable picture instead of a blank circle.
 */
export function UserPhoto({ name, size = 36, photoUrl, shape = 'circle', status, className }: UserPhotoProps) {
  const uid = useId().replace(/:/g, '')
  const [failed, setFailed] = useState(false)
  const src = failed ? null : (photoUrl ?? portraitFor(name))
  const h = hash(name)
  const skin = SKINS[h % SKINS.length] ?? '#e8b88f'
  const hair = HAIRS[(h >> 3) % HAIRS.length] ?? '#1f1a17'
  const [bg1, bg2] = BACKGROUNDS[(h >> 5) % BACKGROUNDS.length] ?? BACKGROUNDS[0] ?? ['#fff', '#eee']
  const style = (h >> 7) % 5
  const clinician = isClinician(name)
  const scrub = SCRUBS[(h >> 9) % SCRUBS.length] ?? '#15c8e9'
  const radius = shape === 'circle' ? '9999px' : `${Math.round(size * 0.23)}px`

  const top =
    style === 3
      ? 'M21 25 C22 17 27 14 32 14 C37 14 42 17 43 25 C40 20 36 19 32 19 C28 19 24 20 21 25Z'
      : style === 4
        ? 'M20.5 28 C19 14 28 10 34 11 C41 12 45 18 43.5 28 C42 22 38 18 31 18 C26 18 22 22 20.5 28Z'
        : 'M20.5 27 C20 15 27 11 32 11 C38 11 44.5 15 43.5 27 C41 21 37 19.5 32 19.5 C27 19.5 23 21 20.5 27Z'

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span className="block h-full w-full overflow-hidden border border-white shadow-[0_1px_4px_rgba(15,40,60,0.18)]" style={{ borderRadius: radius }}>
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={bg1} />
                <stop offset="1" stopColor={bg2} />
              </linearGradient>
            </defs>
            <rect width="64" height="64" fill={`url(#bg-${uid})`} />
            {style === 1 && <path d="M19 28 C18 14 26 10 32 10 C38 10 46 14 45 28 L47 48 L17 48Z" fill={hair} />}
            <path d="M6 66 C6 50 19 45 32 45 C45 45 58 50 58 66Z" fill={clinician ? '#ffffff' : scrub} />
            {clinician ? (
              <>
                <path d="M6 66 C6 50 19 45 32 45 C45 45 58 50 58 66Z" fill="none" stroke="#d5e3ea" strokeWidth="1" />
                <path d="M25.5 45.5 L32 57 L38.5 45.5Z" fill="#15c8e9" />
              </>
            ) : (
              <path d="M26 45.5 Q32 52 38 45.5" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
            )}
            <rect x="27.5" y="37" width="9" height="10" rx="4" fill={skin} />
            <ellipse cx="32" cy="28" rx="11" ry="12.5" fill={skin} />
            <path d={top} fill={hair} />
            {style === 2 && <circle cx="32" cy="9.5" r="5" fill={hair} />}
            <circle cx="28" cy="29" r="1.15" fill="#2b2320" />
            <circle cx="36" cy="29" r="1.15" fill="#2b2320" />
            <path d="M28.5 34.5 Q32 37 35.5 34.5" fill="none" stroke="#2b2320" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
          style={{ background: status, width: Math.max(9, size * 0.2), height: Math.max(9, size * 0.2) }}
        />
      )}
    </span>
  )
}
