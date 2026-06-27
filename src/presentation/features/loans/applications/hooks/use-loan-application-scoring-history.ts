import { useCallback, useState } from 'react'
import { GetLoanApplicationScoringHistoryAction } from '@/core/actions/loan-applications/get-loan-application-scoring-history.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreHistoryItemResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-history-item.response'

interface LoanApplicationScoringHistoryState {
  history: LoanApplicationCreditScoreHistoryItemResponse[]
  isLoading: boolean
  error: string | null
}

const mapLoadError = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 403) return 'No autorizado para consultar el historial de scoring.'
  return result.error
}

export const useLoanApplicationScoringHistory = () => {
  const [state, setState] = useState<LoanApplicationScoringHistoryState>({
    history: [],
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (id: string): Promise<ApiResult<LoanApplicationCreditScoreHistoryItemResponse[]>> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await new GetLoanApplicationScoringHistoryAction().execute(id)
      setState({
        history: result.success ? result.data : [],
        isLoading: false,
        error: result.success ? null : mapLoadError(result),
      })
      return result
    },
    [],
  )

  const clear = useCallback(() => {
    setState({
      history: [],
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    load,
    refetch: load,
    clear,
  }
}
