type ClassValue = string | false | null | undefined

/** Minimal class-name joiner. */
export const cn = (...values: ClassValue[]): string => values.filter(Boolean).join(' ')
