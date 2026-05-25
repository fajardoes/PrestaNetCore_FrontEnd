import { useCallback, useState } from 'react'
import { GetLoanActionsAction } from '@/core/actions/loans/get-loan-actions.action'
import { GetLoanDisbursementReversalEligibilityAction } from '@/core/actions/loans/get-loan-disbursement-reversal-eligibility.action'
import { GetLoanAction } from '@/core/actions/loans/get-loan.action'
import { ReverseLoanDisbursementAction } from '@/core/actions/loans/reverse-loan-disbursement.action'
import type { LoanDisbursementReversalRequest } from '@/infrastructure/loans/requests/loan-disbursement-reversal-request'
import type { LoanAllowedAction } from '@/infrastructure/loans/responses/loan-actions-response'
import type { LoanDisbursementReversalEligibilityResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'
import type { LoanDisbursementReversalResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

interface LoadLoanOptions {
  includeEligibility?: boolean
}

const mapMutationError = (result: {
  success: boolean
  status?: number
  error?: string
}) => {
  if (result.success) return null
  if (result.status === 403) return 'No autorizado para ejecutar esta acción.'
  if (result.status === 400) return result.error || 'La solicitud contiene datos inválidos.'
  if (result.status === 409) {
    return (
      result.error ||
      'No es posible revertir el desembolso porque existen movimientos posteriores o restricciones contables.'
    )
  }
  return result.error || 'No fue posible completar la acción.'
}

export const useLoan = () => {
  const [loan, setLoan] = useState<LoanResponse | null>(null)
  const [allowedActions, setAllowedActions] = useState<LoanAllowedAction[]>([])
  const [actionsError, setActionsError] = useState<string | null>(null)
  const [eligibility, setEligibility] =
    useState<LoanDisbursementReversalEligibilityResponse | null>(null)
  const [eligibilityError, setEligibilityError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [isReversing, setIsReversing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadLoan = useCallback(async (loanId: string, options?: LoadLoanOptions) => {
    const includeEligibility = options?.includeEligibility ?? false
    setIsLoading(true)
    setError(null)
    setActionsError(null)
    setMutationError(null)
    if (!includeEligibility) {
      setEligibility(null)
      setEligibilityError(null)
      setIsLoadingEligibility(false)
    } else {
      setIsLoadingEligibility(true)
    }

    const [loanResult, actionsResult, eligibilityResult] = await Promise.all([
      new GetLoanAction().execute(loanId),
      new GetLoanActionsAction().execute(loanId),
      includeEligibility
        ? new GetLoanDisbursementReversalEligibilityAction().execute(loanId)
        : Promise.resolve(null),
    ])

    if (loanResult.success) {
      setLoan(loanResult.data)
    } else {
      setLoan(null)
      setAllowedActions([])
      setEligibility(null)
      setError(loanResult.error)
    }

    if (actionsResult.success) {
      setAllowedActions(actionsResult.data.allowedActions as LoanAllowedAction[])
      setActionsError(null)
    } else {
      setAllowedActions([])
      setActionsError(actionsResult.error)
    }

    if (includeEligibility) {
      if (eligibilityResult?.success) {
        setEligibility(eligibilityResult.data)
        setEligibilityError(null)
      } else {
        setEligibility(null)
        setEligibilityError(eligibilityResult?.error ?? null)
      }
      setIsLoadingEligibility(false)
    }

    setIsLoading(false)
  }, [])

  const reverseDisbursement = useCallback(
    async (
      loanId: string,
      payload: LoanDisbursementReversalRequest,
    ): Promise<
      | { success: true; data: LoanDisbursementReversalResponse }
      | { success: false; error: string; status?: number }
    > => {
      setIsReversing(true)
      setMutationError(null)
      const result = await new ReverseLoanDisbursementAction().execute(loanId, payload)
      setIsReversing(false)
      setMutationError(result.success ? null : mapMutationError(result))
      return result
    },
    [],
  )

  return {
    loan,
    allowedActions,
    actionsError,
    eligibility,
    eligibilityError,
    isLoading,
    isLoadingEligibility,
    isReversing,
    error,
    mutationError,
    setMutationError,
    loadLoan,
    reverseDisbursement,
  }
}
