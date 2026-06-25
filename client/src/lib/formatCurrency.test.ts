import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('divides minor units by 100 and formats with the currency symbol', () => {
    expect(formatCurrency(199_900, 'USD')).toBe('$1,999.00')
  })

  it('formats a different currency with its own symbol', () => {
    expect(formatCurrency(500_000, 'EUR')).toBe('€5,000.00')
  })

  it('formats INR using its currency symbol', () => {
    expect(formatCurrency(123_456, 'INR')).toBe('₹1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })
})
