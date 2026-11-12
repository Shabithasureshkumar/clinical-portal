const escapeCell = (value: string | number): string => {
  let s = String(value)
  // Neutralise spreadsheet formula injection when the file is opened in Excel or Sheets.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (header: string[], rows: (string | number)[][]): string =>
  [header, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n')

/** Triggers a client-side file download. Nothing is sent to a server. */
export const downloadFile = (filename: string, content: string, mime = 'text/csv;charset=utf-8'): void => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
