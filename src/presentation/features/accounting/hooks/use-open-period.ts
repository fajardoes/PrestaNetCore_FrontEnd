import { useCallback, useState } from 'react'
import { openPeriodAction } from '@/core/actions/accounting/open-period.action'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { OpenPeriodRequest } from '@/infrastructure/interfaces/accounting/requests/open-period.request'

interface UseOpenPeriodOptions {
  onCompleted?: (period: AccountingPeriodDto) => void
}

export const useOpenPeriod = (options?: UseOpenPeriodOptions) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPeriod = useCallback(
    async (payload: OpenPeriodRequest) => {
      setIsLoading(true)
      setError(null)
      const result = await openPeriodAction(payload)
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
    openPeriod,
    isLoading,
    error,
  }
}
