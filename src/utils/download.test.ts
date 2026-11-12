import { describe, expect, it } from 'vitest'
import { toCsv } from './download'

describe('toCsv', () => {
  it('builds a header and rows', () => {
    expect(toCsv(['a', 'b'], [[1, 'x']])).toBe('a,b\r\n1,x')
  })

  it('quotes cells containing commas, quotes and newlines', () => {
    expect(toCsv(['v'], [['a,b'], ['say "hi"'], ['l1\nl2']])).toBe('v\r\n"a,b"\r\n"say ""hi"""\r\n"l1\nl2"')
  })

  it('neutralises spreadsheet formula injection', () => {
    const csv = toCsv(['v'], [['=HYPERLINK("http://evil")'], ['+1'], ['-1'], ['@sum']])
    for (const line of csv.split('\r\n').slice(1)) expect(line.replace(/^"/, '')).toMatch(/^'/)
  })
})
