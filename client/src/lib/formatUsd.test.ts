import { describe, expect, it } from 'vitest'
import { abbreviateUsd, formatUsdExact } from './formatUsd'

describe('abbreviateUsd', () => {
  it('abbreviates millions to one decimal place', () => {
    expect(abbreviateUsd(1_200_000)).toBe('$1.2M')
  })

  it('abbreviates billions to one decimal place', () => {
    expect(abbreviateUsd(2_500_000_000)).toBe('$2.5B')
  })

  it('shows sub-million values exactly, with cents', () => {
    expect(abbreviateUsd(950)).toBe('$950.00')
  })

  it('shows zero exactly', () => {
    expect(abbreviateUsd(0)).toBe('$0.00')
  })
})

describe('formatUsdExact', () => {
  it('formats with full precision and thousands separators', () => {
    expect(formatUsdExact(1_200_000)).toBe('$1,200,000.00')
  })
})
