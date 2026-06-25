import { useEffect, useState } from 'react'
import { getPayInsights } from '@/api/analytics'
import type { PayInsights } from '@/api/types'

export function usePayInsights() {
  const [data, setData] = useState<PayInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getPayInsights()
      .then((result) => {
        if (cancelled) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
