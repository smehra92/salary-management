/**
 * Conversion rate for a single currency. `rateToUsd` is the number of US
 * dollars that 1 unit of `currencyCode` is worth (e.g. INR -> 0.012 means
 * 1 INR = $0.012). USD itself has a rate of 1.
 */
export interface CurrencyRate {
  currencyCode: string;
  rateToUsd: number;
}

function findRate(currencyCode: string, rates: CurrencyRate[]): CurrencyRate {
  const rate = rates.find((r) => r.currencyCode === currencyCode);
  if (!rate) {
    throw new Error(`Unknown currency code: "${currencyCode}". No matching entry in the rate table.`);
  }

  return rate;
}

/**
 * Converts an amount in `currencyCode` to USD using the given rate table,
 * by multiplying the amount by that currency's `rateToUsd`.
 */
export function convertToUsd(amount: number, currencyCode: string, rates: CurrencyRate[]): number {
  if (amount < 0) {
    throw new Error(`Amount must not be negative, received ${amount}.`);
  }

  const rate = findRate(currencyCode, rates);

  return amount * rate.rateToUsd;
}
