import { useCallback, useState } from 'react'
import { closePeriodAction } from '@/core/actions/accounting/close-period.action'
import type { AccountingPeriod } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { ClosePeriodRequest } from '@/infrastructure/interfaces/accounting/requests/close-period.request'

interface UseClosePeriodOptions {
  onCompleted?: (period: AccountingPeriod) => void
}

export const useClosePeriod = (options?: UseClosePeriodOptions) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closePeriod = useCallback(
    async (periodId: string, payload: ClosePeriodRequest) => {
      setIsLoading(true)
      setError(null)
      const result = await closePeriodAction(periodId, payload)
      if (result.success) {
        options?.onCompleted?.(result.data)
        setIsLoading(false)
        return { success: true, period: result.data }
      }
      setError(result.error)
      setIsLoading(false)
      return { success: false, error: result.error }
    },
    [options],
  )

  return {
    closePeriod,
    isLoading,
    error,
  }
}
