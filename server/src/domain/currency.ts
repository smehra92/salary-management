export interface CurrencyRate {
  currencyCode: string;
  rateToUsd: number;
}

export function convertToUsd(amount: number, currencyCode: string, rates: CurrencyRate[]): number {
  if (amount < 0) {
    throw new Error(`Amount must not be negative: ${amount}`);
  }

  const rate = rates.find((r) => r.currencyCode === currencyCode);
  if (!rate) {
    throw new Error(`Unknown currency code: ${currencyCode}`);
  }

  return amount * rate.rateToUsd;
}
