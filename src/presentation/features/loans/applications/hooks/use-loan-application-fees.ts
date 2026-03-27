import { useCallback, useState } from 'react'
import { GetLoanApplicationFeesAction } from '@/core/actions/loan-applications/get-loan-application-fees.action'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'

interface LoanApplicationFeesState {
  fees: LoanApplicationFeeResponse[]
  isLoading: boolean
  error: string | null
}

export const useLoanApplicationFees = () => {
  const [state, setState] = useState<LoanApplicationFeesState>({
    fees: [],
    isLoading: false,
    error: null,
  })

  const loadByApplicationId = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await new GetLoanApplicationFeesAction().execute(id)
    setState({
      fees: result.success ? result.data : [],
      isLoading: false,
      error: result.success ? null : result.error,
    })
    return result
  }, [])

  const setFees = useCallback((fees: LoanApplicationFeeResponse[]) => {
    setState((prev) => ({ ...prev, fees }))
  }, [])

  return {
    ...state,
    loadByApplicationId,
    setFees,
  }
}
