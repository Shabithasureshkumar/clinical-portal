/**
 * Demo profile photos.
 *
 * These are public stock portraits of unnamed people from the randomuser.me gallery,
 * assigned to the fictional demo people used in the mock data. To use your own photos,
 * put files in /public/avatars and point entries here at e.g. "/avatars/sarah-williams.jpg",
 * or supply `photoUrl` from the API once a backend exists.
 */
const portrait = (group: 'men' | 'women', n: number): string => `https://randomuser.me/api/portraits/${group}/${n}.jpg`

const ASSIGNED: Record<string, string> = {
  'sarah williams': portrait('women', 44),
  'dr. sarah williams': portrait('women', 44),
  'dr. williams': portrait('women', 44),
  'dr. rajesh kumar': portrait('men', 32),
  'dr. priya patel': portrait('women', 65),
  'np maria garcia': portrait('women', 26),
  'dr. james chen': portrait('men', 75),
  'kevin brown': portrait('men', 52),
  'dr. aisha rao': portrait('women', 79),
  'maya patel, np': portrait('women', 12),
  'ethan cole': portrait('men', 22),
  'nina okafor': portrait('women', 33),
  'lauren pratt': portrait('women', 90),
  'marco ruiz': portrait('men', 46),
  'hannah boyle': portrait('women', 17),
  'devin marsh': portrait('men', 61),
  'aisha karim': portrait('women', 53),
  'priya nair': portrait('women', 8),
  'sarah johnson': portrait('women', 68),
  'mike lee': portrait('men', 18),
  'tom wright': portrait('men', 85),
  'nina costa': portrait('women', 36),
}

const POOL: string[] = [
  ...[3, 11, 27, 38, 49, 57, 66, 72, 81, 94].map((n) => portrait('men', n)),
  ...[5, 19, 29, 41, 58, 63, 71, 83, 88, 96].map((n) => portrait('women', n)),
]

const hash = (value: string): number => {
  let h = 7
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

/** Stable portrait URL for a person: an explicit assignment, otherwise a deterministic pick. */
export const portraitFor = (name: string): string => {
  const key = name.trim().toLowerCase()
  return ASSIGNED[key] ?? POOL[hash(key) % POOL.length] ?? ''
}
