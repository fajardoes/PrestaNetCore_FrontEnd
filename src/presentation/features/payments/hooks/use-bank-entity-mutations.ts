import { useCallback, useState } from 'react'
import { createBankEntityAction } from '@/core/actions/payments/create-bank-entity.action'
import { updateBankEntityStatusAction } from '@/core/actions/payments/update-bank-entity-status.action'
import { updateBankEntityAction } from '@/core/actions/payments/update-bank-entity.action'
import type { CreateBankEntityRequest } from '@/infrastructure/payments/requests/create-bank-entity-request'
import type { UpdateBankEntityRequest } from '@/infrastructure/payments/requests/update-bank-entity-request'

export const useBankEntityMutations = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: CreateBankEntityRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await createBankEntityAction(payload)
    setIsSaving(false)

    if (!result.success) setError(result.error)
    return result
  }, [])

  const update = useCallback(async (id: string, payload: UpdateBankEntityRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await updateBankEntityAction(id, payload)
    setIsSaving(false)

    if (!result.success) setError(result.error)
    return result
  }, [])

  const updateStatus = useCallback(async (id: string, isActive: boolean) => {
    setIsUpdatingStatus(true)
    setError(null)
    const result = await updateBankEntityStatusAction(id, { isActive })
    setIsUpdatingStatus(false)

    if (!result.success) setError(result.error)
    return result
  }, [])

  return {
    isSaving,
    isUpdatingStatus,
    error,
    setError,
    create,
    update,
    updateStatus,
  }
}
