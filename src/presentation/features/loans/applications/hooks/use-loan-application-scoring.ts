import { useCallback, useState } from 'react'
import { GetLoanApplicationScoringAction } from '@/core/actions/loan-applications/get-loan-application-scoring.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

interface LoanApplicationScoringState {
  scoring: LoanApplicationCreditScoreResponse | null
  isLoading: boolean
  error: string | null
}

const mapLoadError = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 404) return 'La solicitud no tiene scoring vigente.'
  if (result.status === 403) return 'No autorizado para consultar el scoring de la solicitud.'
  return result.error
}

export const useLoanApplicationScoring = () => {
  const [state, setState] = useState<LoanApplicationScoringState>({
    scoring: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (id: string): Promise<ApiResult<LoanApplicationCreditScoreResponse>> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await new GetLoanApplicationScoringAction().execute(id)
    setState({
      scoring: result.success ? result.data : null,
      isLoading: false,
      error: result.success ? null : mapLoadError(result),
    })
    return result
  }, [])

  const clear = useCallback(() => {
    setState({
      scoring: null,
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
