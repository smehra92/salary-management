import type { CurrencyRate } from '../domain/currency.js';
import { db } from '../db.js';

export async function findAllCurrencyRates(): Promise<CurrencyRate[]> {
  return db.currencyRate.findMany({
    select: { currencyCode: true, rateToUsd: true },
  });
}
