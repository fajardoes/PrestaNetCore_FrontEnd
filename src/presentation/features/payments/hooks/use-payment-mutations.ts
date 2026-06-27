import { useCallback, useState } from 'react'
import { approveBankPaymentProofAction } from '@/core/actions/payments/approve-bank-payment-proof.action'
import { effectivizePaymentAction } from '@/core/actions/payments/effectivize-payment.action'
import { rejectBankPaymentProofAction } from '@/core/actions/payments/reject-bank-payment-proof.action'
import { reverseBankPaymentProofAction } from '@/core/actions/payments/reverse-bank-payment-proof.action'
import { reverseCashCollectionPaymentAction } from '@/core/actions/payments/reverse-cash-collection-payment.action'
import { reversePaymentAction } from '@/core/actions/payments/reverse-payment.action'
import { settleCashCollectionPaymentAction } from '@/core/actions/payments/settle-cash-collection-payment.action'
import type { ApproveBankPaymentProofRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { RejectBankPaymentProofRequest } from '@/infrastructure/payments/requests/reject-bank-payment-proof-request'
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

  const settleCash = useCallback(async (paymentId: string) => {
    setIsSubmitting(true)
    setError(null)
    const result = await settleCashCollectionPaymentAction(paymentId)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
    }

    return result
  }, [])

  const approveBankProof = useCallback(
    async (paymentId: string, payload: ApproveBankPaymentProofRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await approveBankPaymentProofAction(paymentId, payload)
      setIsSubmitting(false)

      if (!result.success) {
        setError(result.error)
      }

      return result
    },
    [],
  )

  const rejectBankProof = useCallback(
    async (paymentId: string, payload: RejectBankPaymentProofRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await rejectBankPaymentProofAction(paymentId, payload)
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

  const reverseCash = useCallback(
    async (paymentId: string, payload: ReversePaymentRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await reverseCashCollectionPaymentAction(paymentId, payload)
      setIsSubmitting(false)

      if (!result.success) {
        setError(result.error)
      }

      return result
    },
    [],
  )

  const reverseBankProof = useCallback(
    async (paymentId: string, payload: ReversePaymentRequest) => {
      setIsSubmitting(true)
      setError(null)
      const result = await reverseBankPaymentProofAction(paymentId, payload)
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
    settleCash,
    approveBankProof,
    rejectBankProof,
    reverse,
    reverseCash,
    reverseBankProof,
  }
}
