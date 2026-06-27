import { useCallback, useEffect, useState } from 'react'
import {
  applyLoanAnticipatedInstallmentAction,
  getLoanAnticipatedInstallmentAction,
  reverseLoanAnticipatedInstallmentApplicationAction,
} from '@/core/actions/loans/anticipated-installment.action'
import type {
  ApplyAnticipatedInstallmentRequest,
  ReverseAnticipatedInstallmentApplicationRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type { AnticipatedInstallmentLoanDetailResponse } from '@/infrastructure/loans/responses/anticipated-installment-response'

export const useLoanAnticipatedInstallment = (loanId: string, enabled: boolean) => {
  const [detail, setDetail] = useState<AnticipatedInstallmentLoanDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!loanId || !enabled) {
      setDetail(null)
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await getLoanAnticipatedInstallmentAction(loanId)
    setIsLoading(false)
    if (result.success) {
      setDetail(result.data)
      return
    }
    setDetail(null)
    setError(result.error)
  }, [enabled, loanId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const apply = useCallback(async (payload: ApplyAnticipatedInstallmentRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await applyLoanAnticipatedInstallmentAction(loanId, payload)
    setIsSaving(false)
    if (result.success) await refresh()
    else setError(result.error)
    return result
  }, [loanId, refresh])

  const reverse = useCallback(async (
    applicationId: string,
    payload: ReverseAnticipatedInstallmentApplicationRequest,
  ) => {
    setIsSaving(true)
    setError(null)
    const result = await reverseLoanAnticipatedInstallmentApplicationAction(
      loanId,
      applicationId,
      payload,
    )
    setIsSaving(false)
    if (result.success) await refresh()
    else setError(result.error)
    return result
  }, [loanId, refresh])

  return { detail, isLoading, isSaving, error, refresh, apply, reverse }
}
