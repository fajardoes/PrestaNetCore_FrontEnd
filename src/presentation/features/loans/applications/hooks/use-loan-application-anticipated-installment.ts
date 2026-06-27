import { useCallback, useEffect, useState } from 'react'
import {
  cancelApplicationAnticipatedInstallmentAction,
  getApplicationAnticipatedInstallmentAction,
  listApplicationAnticipatedInstallmentHistoryAction,
  previewApplicationAnticipatedInstallmentLimitAction,
  saveApplicationAnticipatedInstallmentAction,
} from '@/core/actions/loan-applications/anticipated-installment.action'
import type {
  CancelAnticipatedInstallmentRequest,
  UpsertAnticipatedInstallmentRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentEventResponse,
  AnticipatedInstallmentResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'

export const useLoanApplicationAnticipatedInstallment = (
  applicationId: string,
  enabled: boolean,
) => {
  const [data, setData] = useState<AnticipatedInstallmentResponse | null>(null)
  const [history, setHistory] = useState<AnticipatedInstallmentEventResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!applicationId || !enabled) {
      setData(null)
      setHistory([])
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    const [detailResult, historyResult] = await Promise.all([
      getApplicationAnticipatedInstallmentAction(applicationId),
      listApplicationAnticipatedInstallmentHistoryAction(applicationId),
    ])
    setIsLoading(false)
    if (!detailResult.success) {
      setError(detailResult.error)
      return
    }
    setData(detailResult.data)
    if (historyResult.success) {
      setHistory(historyResult.data)
    } else {
      setHistory([])
      setError(historyResult.error)
    }
  }, [applicationId, enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const previewLimit = useCallback(
    async (amount: number) => previewApplicationAnticipatedInstallmentLimitAction(applicationId, { amount }),
    [applicationId],
  )

  const save = useCallback(async (payload: UpsertAnticipatedInstallmentRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await saveApplicationAnticipatedInstallmentAction(applicationId, payload)
    setIsSaving(false)
    if (result.success) {
      await refresh()
    } else {
      setError(result.error)
    }
    return result
  }, [applicationId, refresh])

  const cancel = useCallback(async (payload: CancelAnticipatedInstallmentRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await cancelApplicationAnticipatedInstallmentAction(applicationId, payload)
    setIsSaving(false)
    if (result.success) {
      await refresh()
    } else {
      setError(result.error)
    }
    return result
  }, [applicationId, refresh])

  return { data, history, isLoading, isSaving, error, refresh, previewLimit, save, cancel }
}
