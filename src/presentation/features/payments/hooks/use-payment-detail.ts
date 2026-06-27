import { useCallback, useEffect, useState } from 'react'
import { getBankPaymentProofAction } from '@/core/actions/payments/get-bank-payment-proof.action'
import { getPaymentAction } from '@/core/actions/payments/get-payment.action'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export type PaymentDetailSource = 'common' | 'bank-proof'

export const usePaymentDetail = (
  paymentId?: string,
  source: PaymentDetailSource = 'common',
  enabled = true,
) => {
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setPayment(null)
      setIsLoading(false)
      setError(null)
      return
    }

    if (!paymentId) {
      setPayment(null)
      setIsLoading(false)
      setError('Pago no especificado.')
      return
    }

    setIsLoading(true)
    setError(null)
    const result =
      source === 'bank-proof'
        ? await getBankPaymentProofAction(paymentId)
        : await getPaymentAction(paymentId)
    setIsLoading(false)

    if (!result.success) {
      setPayment(null)
      setError(result.error)
      return
    }

    setPayment(result.data)
  }, [enabled, paymentId, source])

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
