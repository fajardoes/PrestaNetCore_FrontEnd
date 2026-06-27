import { useCallback, useState } from 'react'
import {
  updatePeriodPostingSettingsAction,
  type PeriodPostingOperation,
} from '@/core/actions/accounting/update-period-posting-settings.action'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

export const usePeriodPostingSettings = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (periodId: string, operation: PeriodPostingOperation) => {
    setIsLoading(true)
    setError(null)
    const result = await updatePeriodPostingSettingsAction(periodId, operation)
    if (result.success) {
      setIsLoading(false)
      return result as { success: true; data: AccountingPeriodDto }
    }
    setError(result.error)
    setIsLoading(false)
    return result
  }, [])

  return {
    mutate,
    isLoading,
    error,
    setError,
  }
}
