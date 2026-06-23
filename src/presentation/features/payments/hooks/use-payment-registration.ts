import { useCallback, useState } from 'react'
import { registerBankPaymentProofAction } from '@/core/actions/payments/register-bank-payment-proof.action'
import { registerCashCollectionPaymentAction } from '@/core/actions/payments/register-cash-collection-payment.action'
import { registerPaymentAction } from '@/core/actions/payments/register-payment.action'
import type {
  RegisterBankPaymentProofRequest,
  RegisterCashCollectionPaymentRequest,
  RegisterPaymentRequest,
} from '@/infrastructure/payments/requests/register-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const usePaymentRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPayment, setLastPayment] = useState<PaymentResponse | null>(null)

  const submit = useCallback(async (payload: RegisterPaymentRequest) => {
    setIsSubmitting(true)
    setError(null)
    const result = await registerPaymentAction(payload)
    setIsSubmitting(false)

    if (!result.success) {
      setLastPayment(null)
      setError(result.error)
      return result
    }

    setLastPayment(result.data)
    return result
  }, [])

  const submitCashCollection = useCallback(
    async (payload: RegisterCashCollectionPaymentRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await registerCashCollectionPaymentAction(payload)
      setIsSubmitting(false)

      if (!result.success) {
        setLastPayment(null)
        setError(result.error)
        return result
      }

      setLastPayment(result.data)
      return result
    },
    [],
  )

  const submitBankProof = useCallback(async (payload: RegisterBankPaymentProofRequest) => {
    setIsSubmitting(true)
    setError(null)
    const result = await registerBankPaymentProofAction(payload)
    setIsSubmitting(false)

    if (!result.success) {
      setLastPayment(null)
      setError(result.error)
      return result
    }

    setLastPayment(result.data)
    return result
  }, [])

  return {
    isSubmitting,
    error,
    lastPayment,
    setError,
    setLastPayment,
    submit,
    submitCashCollection,
    submitBankProof,
  }
}
