import { useCallback, useEffect, useState } from 'react'
import { listPaymentComponentPrioritiesAction } from '@/core/actions/payments/list-payment-component-priorities.action'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'

export const usePaymentComponentPriorities = (enabled = true) => {
  const [items, setItems] = useState<PaymentComponentPriorityResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await listPaymentComponentPrioritiesAction()
    setIsLoading(false)

    if (!result.success) {
      setItems([])
      setError(result.error)
      return
    }

    setItems(result.data)
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    items,
    isLoading,
    error,
    refresh,
    setItems,
  }
}
