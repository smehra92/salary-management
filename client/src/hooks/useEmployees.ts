import { useCallback, useEffect, useState } from 'react'
import { getEmployees } from '@/api/employees'
import type { Employee } from '@/api/types'

const PAGE_SIZE = 25

export function useEmployees() {
  const [data, setData] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getEmployees({ page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setData(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
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
  }, [page])

  const setPage = useCallback(
    (next: number) => {
      setPageState(Math.min(Math.max(next, 1), totalPages || 1))
    },
    [totalPages],
  )

  return { data, total, page, pageSize: PAGE_SIZE, totalPages, loading, error, setPage }
}
