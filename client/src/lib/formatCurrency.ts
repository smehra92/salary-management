/** Minor units (cents/paise) to major units, e.g. for prefilling an edit form. */
export function minorToMajor(amountMinorUnits: number): number {
  return amountMinorUnits / 100
}

/** Major units to minor units (rounded to the nearest integer), matching the server's conversion. */
export function majorToMinor(amountMajorUnits: number): number {
  return Math.round(amountMajorUnits * 100)
}

/** salaryAmount is stored in MINOR units (cents/paise); divide by 100 for display. */
export function formatCurrency(amountMinorUnits: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(minorToMajor(amountMinorUnits))
}
