import { get } from './client'
import type { PayInsights } from './types'

export function getPayInsights(): Promise<PayInsights> {
  return get<PayInsights>('/analytics/pay-insights')
}
