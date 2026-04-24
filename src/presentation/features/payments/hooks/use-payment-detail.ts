import { useCallback, useEffect, useState } from 'react'
import { getPaymentAction } from '@/core/actions/payments/get-payment.action'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const usePaymentDetail = (paymentId?: string) => {
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!paymentId) {
      setPayment(null)
      setIsLoading(false)
      setError('Pago no especificado.')
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await getPaymentAction(paymentId)
    setIsLoading(false)

    if (!result.success) {
      setPayment(null)
      setError(result.error)
      return
    }

    setPayment(result.data)
  }, [paymentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    payment,
    isLoading,
    error,
    refresh,
  }
}
