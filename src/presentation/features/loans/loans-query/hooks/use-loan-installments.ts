import { useCallback, useState } from 'react'
import { ListLoanInstallmentsAction } from '@/core/actions/loans/list-loan-installments.action'
import type { LoanInstallmentResponse } from '@/infrastructure/loans/responses/loan-installment-response'

export const useLoanInstallments = () => {
  const [installments, setInstallments] = useState<LoanInstallmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInstallments = useCallback(async (loanId: string) => {
    setIsLoading(true)
    setError(null)
    const result = await new ListLoanInstallmentsAction().execute(loanId)
    if (result.success) {
      setInstallments(result.data)
      setIsLoading(false)
      return
    }

    setInstallments([])
    setError(result.error)
    setIsLoading(false)
  }, [])

  return {
    installments,
    isLoading,
    error,
    loadInstallments,
  }
}
