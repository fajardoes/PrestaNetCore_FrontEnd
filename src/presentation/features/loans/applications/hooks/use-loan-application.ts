import { useCallback, useState } from 'react'
import { GetLoanApplicationActionsAction } from '@/core/actions/loan-applications/get-loan-application-actions.action'
import { GetLoanApplicationAction } from '@/core/actions/loan-applications/get-loan-application.action'
import { ListLoanApplicationCollateralsAction } from '@/core/actions/loan-applications/list-loan-application-collaterals.action'
import type { LoanApplicationAllowedAction } from '@/infrastructure/loans/responses/loan-application-actions-response'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

interface LoanApplicationDetailState {
  application: LoanApplicationResponse | null
  collaterals: LoanApplicationCollateralResponse[]
  allowedActions: LoanApplicationAllowedAction[]
  isLoading: boolean
  error: string | null
  actionsError: string | null
}

export const useLoanApplication = () => {
  const [state, setState] = useState<LoanApplicationDetailState>({
    application: null,
    collaterals: [],
    allowedActions: [],
    isLoading: false,
    error: null,
    actionsError: null,
  })

  const loadById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, actionsError: null }))
    const [applicationResult, collateralsResult, actionsResult] = await Promise.all([
      new GetLoanApplicationAction().execute(id),
      new ListLoanApplicationCollateralsAction().execute(id),
      new GetLoanApplicationActionsAction().execute(id),
    ])

    if (!applicationResult.success) {
      setState({
        application: null,
        collaterals: [],
        allowedActions: [],
        isLoading: false,
        error: applicationResult.error,
        actionsError: null,
      })
      return
    }

    setState({
      application: applicationResult.data,
      collaterals: collateralsResult.success ? collateralsResult.data : [],
      allowedActions: actionsResult.success
        ? (actionsResult.data.allowedActions as LoanApplicationAllowedAction[])
        : [],
      isLoading: false,
      error: collateralsResult.success ? null : collateralsResult.error,
      actionsError: actionsResult.success ? null : actionsResult.error,
    })
  }, [])

  const setCollaterals = useCallback((collaterals: LoanApplicationCollateralResponse[]) => {
    setState((prev) => ({ ...prev, collaterals }))
  }, [])

  const setApplication = useCallback((application: LoanApplicationResponse) => {
    setState((prev) => ({ ...prev, application }))
  }, [])

  const setAllowedActions = useCallback(
    (allowedActions: LoanApplicationAllowedAction[]) => {
      setState((prev) => ({ ...prev, allowedActions }))
    },
    [],
  )

  return {
    ...state,
    loadById,
    setApplication,
    setCollaterals,
    setAllowedActions,
  }
}
