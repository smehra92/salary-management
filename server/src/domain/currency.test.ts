import { describe, expect, it } from 'vitest';
import { convertToUsd } from './currency.js';

const rates = [
  { currencyCode: 'USD', rateToUsd: 1 },
  { currencyCode: 'INR', rateToUsd: 0.012 },
  { currencyCode: 'EUR', rateToUsd: 1.08 },
];

describe('convertToUsd', () => {
  it('converts a non-USD amount to USD', () => {
    const result = convertToUsd(100000, 'INR', rates);

    expect(result).toBeCloseTo(1200, 2);
  });

  it('returns the same amount when the currency is already USD', () => {
    const result = convertToUsd(500, 'USD', rates);

    expect(result).toBeCloseTo(500, 2);
  });

  it('converts EUR correctly', () => {
    const result = convertToUsd(200, 'EUR', rates);

    expect(result).toBeCloseTo(216, 2);
  });

  it('throws a clear error when the currency code is not in the rate table', () => {
    expect(() => convertToUsd(100, 'GBP', rates)).toThrow(/GBP/);
  });

  it('throws when amount is negative', () => {
    expect(() => convertToUsd(-100, 'USD', rates)).toThrow(/negative/i);
  });
});
