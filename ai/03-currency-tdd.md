In server/, create the first TDD cycle for currency normalization. This step is
RED only: write the test, do NOT write the implementation yet.

Create src/domain/currency.test.ts. It tests a function convertToUsd(amount,
currencyCode, rates) that will live in src/domain/currency.ts. A rate is
{ currencyCode: string, rateToUsd: number } meaning 1 unit of that currency
equals rateToUsd US dollars.

Use this fixed rate table inside the test (keep it deterministic):
  USD -> 1, INR -> 0.012, EUR -> 1.08

Write these test cases:
1. converts a non-USD amount to USD (e.g. 100000 INR). Use expect(...).toBeCloseTo(value, 2)
   for all money assertions, because floating-point money math is not exact.
2. returns the same amount when the currency is already USD (base currency).
3. converts EUR correctly.
4. throws a clear error when the currency code is not in the rate table.
5. throws when amount is negative.

Import convertToUsd from "./currency". Do NOT create currency.ts — I want this
test to fail first. Run `npm test` and confirm it fails because the module/function
doesn't exist. Stop there.