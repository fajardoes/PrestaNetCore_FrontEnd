import { useCallback, useEffect, useState } from 'react'
import { getDailyClosingRunAction } from '@/core/actions/loans/get-daily-closing-run.action'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

interface DailyClosingRunDetailState {
  run: DailyLoanClosingRunResponse | null
  isLoading: boolean
  error: string | null
}

export const useDailyClosingRunDetail = (id: string | undefined, enabled = true) => {
  const [state, setState] = useState<DailyClosingRunDetailState>({
    run: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async () => {
    if (!enabled || !id) {
      setState({ run: null, isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getDailyClosingRunAction(id)
    if (!result.success) {
      setState({ run: null, isLoading: false, error: result.error })
      return
    }

    setState({ run: result.data, isLoading: false, error: null })
  }, [enabled, id])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    refresh: load,
  }
}
