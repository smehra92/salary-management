/** Full-precision USD format, e.g. for a tooltip or title showing the exact figure. */
export function formatUsdExact(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

/** Abbreviates millions/billions for readability (e.g. 1_200_000 -> "$1.2M"); smaller values are shown exactly. */
export function abbreviateUsd(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }

  return formatUsdExact(value)
}
