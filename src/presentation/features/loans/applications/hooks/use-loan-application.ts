import { useCallback, useState } from 'react'
import { GetLoanApplicationAction } from '@/core/actions/loan-applications/get-loan-application.action'
import { ListLoanApplicationCollateralsAction } from '@/core/actions/loan-applications/list-loan-application-collaterals.action'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

interface LoanApplicationDetailState {
  application: LoanApplicationResponse | null
  collaterals: LoanApplicationCollateralResponse[]
  isLoading: boolean
  error: string | null
}

export const useLoanApplication = () => {
  const [state, setState] = useState<LoanApplicationDetailState>({
    application: null,
    collaterals: [],
    isLoading: false,
    error: null,
  })

  const loadById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const [applicationResult, collateralsResult] = await Promise.all([
      new GetLoanApplicationAction().execute(id),
      new ListLoanApplicationCollateralsAction().execute(id),
    ])

    if (!applicationResult.success) {
      setState({
        application: null,
        collaterals: [],
        isLoading: false,
        error: applicationResult.error,
      })
      return
    }

    setState({
      application: applicationResult.data,
      collaterals: collateralsResult.success ? collateralsResult.data : [],
      isLoading: false,
      error: collateralsResult.success ? null : collateralsResult.error,
    })
  }, [])

  const setCollaterals = useCallback((collaterals: LoanApplicationCollateralResponse[]) => {
    setState((prev) => ({ ...prev, collaterals }))
  }, [])

  const setApplication = useCallback((application: LoanApplicationResponse) => {
    setState((prev) => ({ ...prev, application }))
  }, [])

  return {
    ...state,
    loadById,
    setApplication,
    setCollaterals,
  }
}
