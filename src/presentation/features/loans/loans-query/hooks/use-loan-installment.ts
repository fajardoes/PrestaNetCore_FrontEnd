import { useCallback, useRef, useState } from 'react'
import { GetLoanInstallmentAction } from '@/core/actions/loans/get-loan-installment.action'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'

export const useLoanInstallment = () => {
  const [installment, setInstallment] = useState<LoanInstallmentDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const loadInstallment = useCallback(async (loanId: string, installmentNo: number) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setError(null)
    setInstallment(null)
    const result = await new GetLoanInstallmentAction().execute(loanId, installmentNo)
    if (requestId !== requestIdRef.current) return

    if (result.success) {
      setInstallment(result.data)
      setIsLoading(false)
      return
    }

    setInstallment(null)
    setError(result.error)
    setIsLoading(false)
  }, [])

  return {
    installment,
    isLoading,
    error,
    loadInstallment,
  }
}
