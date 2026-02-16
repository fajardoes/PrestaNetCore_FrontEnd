import { useCallback, useState } from 'react'
import { GetLoanAction } from '@/core/actions/loans/get-loan.action'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

export const useLoan = () => {
  const [loan, setLoan] = useState<LoanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLoan = useCallback(async (loanId: string) => {
    setIsLoading(true)
    setError(null)
    const result = await new GetLoanAction().execute(loanId)
    if (result.success) {
      setLoan(result.data)
      setIsLoading(false)
      return
    }

    setLoan(null)
    setError(result.error)
    setIsLoading(false)
  }, [])

  return {
    loan,
    isLoading,
    error,
    loadLoan,
  }
}
