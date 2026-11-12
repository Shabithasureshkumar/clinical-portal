export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

export const formatCurrency0 = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export const initialsOf = (name: string): string =>
  name
    .replace(/^(Dr\.|NP)\s+/, '')
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

