import { useCallback, useState } from 'react'
import { effectivizePaymentAction } from '@/core/actions/payments/effectivize-payment.action'
import { reversePaymentAction } from '@/core/actions/payments/reverse-payment.action'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { ReversePaymentRequest } from '@/infrastructure/payments/requests/reverse-payment-request'

export const usePaymentMutations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectivize = useCallback(
    async (paymentId: string, payload: EffectivizePaymentRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await effectivizePaymentAction(paymentId, payload)
      setIsSubmitting(false)

      if (!result.success) {
        setError(result.error)
      }

      return result
    },
    [],
  )

  const reverse = useCallback(
    async (paymentId: string, payload: ReversePaymentRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await reversePaymentAction(paymentId, payload)
      setIsSubmitting(false)

      if (!result.success) {
        setError(result.error)
      }

      return result
    },
    [],
  )

  return {
    isSubmitting,
    error,
    setError,
    effectivize,
    reverse,
  }
}
