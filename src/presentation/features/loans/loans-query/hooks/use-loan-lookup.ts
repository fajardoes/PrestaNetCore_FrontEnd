import { useCallback, useState } from 'react'
import { GetLoanByCodeAction } from '@/core/actions/loans/get-loan-by-code.action'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

export const useLoanLookup = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findByCode = useCallback(async (loanCode: string) => {
    setIsLoading(true)
    setError(null)

    const result = await new GetLoanByCodeAction().execute(loanCode)

    setIsLoading(false)

    if (!result.success) {
      setError(result.error)
      return result
    }

    return result as { success: true; data: LoanResponse }
  }, [])

  return {
    isLoading,
    error,
    findByCode,
  }
}
