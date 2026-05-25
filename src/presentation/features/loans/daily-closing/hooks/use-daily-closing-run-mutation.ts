import { useCallback, useState } from 'react'
import { runDailyClosingAction } from '@/core/actions/loans/run-daily-closing.action'
import type { DailyLoanClosingRunRequest } from '@/infrastructure/loans/requests/daily-loan-closing-run-request'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

export const useDailyClosingRunMutation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (
      payload: DailyLoanClosingRunRequest,
    ): Promise<DailyLoanClosingRunResponse | null> => {
      setIsLoading(true)
      setError(null)
      const result = await runDailyClosingAction(payload)
      setIsLoading(false)

      if (!result.success) {
        setError(result.error)
        return null
      }

      return result.data
    },
    [],
  )

  return {
    run,
    isLoading,
    error,
    setError,
  }
}
