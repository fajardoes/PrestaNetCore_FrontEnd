import { useCallback, useEffect, useState } from 'react'
import { getPaymentActionsAction } from '@/core/actions/payments/get-payment-actions.action'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'

export const usePaymentActions = (paymentId?: string, enabled = true) => {
  const [actions, setActions] = useState<PaymentActionsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!paymentId || !enabled) {
      setActions(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await getPaymentActionsAction(paymentId)
    setIsLoading(false)

    if (!result.success) {
      setActions(null)
      setError(result.error)
      return
    }

    setActions(result.data)
  }, [enabled, paymentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    actions,
    isLoading,
    error,
    refresh,
  }
}
