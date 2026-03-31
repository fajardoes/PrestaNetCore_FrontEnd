import { useCallback, useState } from 'react'
import { GetLoanAction } from '@/core/actions/loans/get-loan.action'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

export const useLoanApplicationApprovedLoan = () => {
  const [loanDetail, setLoanDetail] = useState<LoanResponse | null>(null)
  const [isLoadingLoanDetail, setIsLoadingLoanDetail] = useState(false)
  const [loanDetailError, setLoanDetailError] = useState<string | null>(null)

  const loadApprovedLoan = useCallback(async (approvedLoanId?: string | null) => {
    const normalizedApprovedLoanId = approvedLoanId?.trim() ?? ''
    if (!normalizedApprovedLoanId) {
      setLoanDetail(null)
      setLoanDetailError(null)
      setIsLoadingLoanDetail(false)
      return
    }

    setIsLoadingLoanDetail(true)
    setLoanDetailError(null)
    const result = await new GetLoanAction().execute(normalizedApprovedLoanId)

    if (result.success) {
      setLoanDetail(result.data)
      setLoanDetailError(null)
    } else {
      setLoanDetail(null)
      setLoanDetailError(result.error)
    }

    setIsLoadingLoanDetail(false)
  }, [])

  return {
    loanDetail,
    isLoadingLoanDetail,
    loanDetailError,
    loadApprovedLoan,
  }
}
