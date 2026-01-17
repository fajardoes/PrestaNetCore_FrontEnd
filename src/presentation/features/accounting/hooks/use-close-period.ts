import { useCallback, useState } from 'react'
import { closePeriodAction } from '@/core/actions/accounting/close-period.action'
import type { ClosePeriodResult } from '@/infrastructure/interfaces/accounting/close-period-result'

export const useClosePeriod = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ClosePeriodResult | null>(null)

  const mutate = useCallback(async (periodId: string, notes?: string) => {
    setIsLoading(true)
    setError(null)
    setData(null)
    const result = await closePeriodAction(periodId, {
      notes: notes?.trim() ? notes.trim() : undefined,
    })
    if (result.success) {
      setData(result.data)
      setIsLoading(false)
      return result
    }
    setError(result.error)
    setIsLoading(false)
    return result
  }, [])

  return {
    mutate,
    data,
    isLoading,
    error,
  }
}
