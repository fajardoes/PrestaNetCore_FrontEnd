import { useCallback, useEffect, useState } from 'react'
import { getDailyClosingStatusAction } from '@/core/actions/loans/get-daily-closing-status.action'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

interface DailyClosingStatusState {
  status: DailyLoanClosingStatusResponse | null
  isLoading: boolean
  error: string | null
}

export const useDailyClosingStatus = (enabled = true) => {
  const [state, setState] = useState<DailyClosingStatusState>({
    status: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (): Promise<DailyLoanClosingStatusResponse | null> => {
    if (!enabled) {
      setState({ status: null, isLoading: false, error: null })
      return null
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getDailyClosingStatusAction()
    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error,
      }))
      return null
    }

    setState({ status: result.data, isLoading: false, error: null })
    return result.data
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    refresh: load,
  }
}
