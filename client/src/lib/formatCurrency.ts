/** salaryAmount is stored in MINOR units (cents/paise); divide by 100 for display. */
export function formatCurrency(amountMinorUnits: number, currencyCode: string): string {
  const amountMajorUnits = amountMinorUnits / 100

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMajorUnits)
}
