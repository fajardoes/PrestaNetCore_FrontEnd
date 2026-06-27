import { useCallback, useState } from 'react'
import { createPaymentComponentPriorityAction } from '@/core/actions/payments/create-payment-component-priority.action'
import { deactivatePaymentComponentPriorityAction } from '@/core/actions/payments/deactivate-payment-component-priority.action'
import { reorderPaymentComponentPrioritiesAction } from '@/core/actions/payments/reorder-payment-component-priorities.action'
import { updatePaymentComponentPriorityAction } from '@/core/actions/payments/update-payment-component-priority.action'
import type { CreatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/create-payment-component-priority-request'
import type { ReorderPaymentComponentPrioritiesRequest } from '@/infrastructure/payments/requests/reorder-payment-component-priorities-request'
import type { UpdatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/update-payment-component-priority-request'

export const usePaymentComponentPriorityMutations = () => {
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  const create = useCallback(async (payload: CreatePaymentComponentPriorityRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await createPaymentComponentPriorityAction(payload)
    setIsSaving(false)
    if (!result.success) {
      setError(result.error)
    }
    return result
  }, [])

  const update = useCallback(
    async (id: string, payload: UpdatePaymentComponentPriorityRequest) => {
      setIsSaving(true)
      setError(null)
      const result = await updatePaymentComponentPriorityAction(id, payload)
      setIsSaving(false)
      if (!result.success) {
        setError(result.error)
      }
      return result
    },
    [],
  )

  const deactivate = useCallback(async (id: string) => {
    setIsDeactivating(true)
    setError(null)
    const result = await deactivatePaymentComponentPriorityAction(id)
    setIsDeactivating(false)
    if (!result.success) {
      setError(result.error)
    }
    return result
  }, [])

  const reorder = useCallback(
    async (payload: ReorderPaymentComponentPrioritiesRequest) => {
      setIsReordering(true)
      setError(null)
      const result = await reorderPaymentComponentPrioritiesAction(payload)
      setIsReordering(false)
      if (!result.success) {
        setError(result.error)
      }
      return result
    },
    [],
  )

  return {
    error,
    isSaving,
    isDeactivating,
    isReordering,
    setError,
    create,
    update,
    deactivate,
    reorder,
  }
}
