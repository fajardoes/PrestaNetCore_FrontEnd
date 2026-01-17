import { useCallback, useState } from 'react'
import { createDelinquencyPolicyAssignmentAction } from '@/core/actions/loans-delinquency-policy-assignment/create-delinquency-policy-assignment.action'
import { updateDelinquencyPolicyAssignmentAction } from '@/core/actions/loans-delinquency-policy-assignment/update-delinquency-policy-assignment.action'
import { updateDelinquencyPolicyAssignmentStatusAction } from '@/core/actions/loans-delinquency-policy-assignment/update-delinquency-policy-assignment-status.action'
import type { CreateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy-assignment.request'
import type { UpdateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment.request'
import type { UpdateDelinquencyPolicyAssignmentStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment-status.request'
import type { ApiResult } from '@/core/helpers/api-result'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'Ya existe una asignación activa con esa combinación.'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail
      ? `Validación: ${detail}`
      : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useDelinquencyPolicyAssignmentMutations = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(
    async (payload: CreateDelinquencyPolicyAssignmentRequestDto) => {
      setIsSaving(true)
      setError(null)
      const result = await createDelinquencyPolicyAssignmentAction(payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [],
  )

  const update = useCallback(
    async (id: string, payload: UpdateDelinquencyPolicyAssignmentRequestDto) => {
      setIsSaving(true)
      setError(null)
      const result = await updateDelinquencyPolicyAssignmentAction(id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [],
  )

  const toggleStatus = useCallback(
    async (id: string, isActive: boolean): Promise<ApiResult<void>> => {
      setIsSaving(true)
      setError(null)
      const payload: UpdateDelinquencyPolicyAssignmentStatusRequestDto = { isActive }
      const result = await updateDelinquencyPolicyAssignmentStatusAction(id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [],
  )

  const clearError = () => setError(null)

  return {
    isSaving,
    error,
    clearError,
    create,
    update,
    toggleStatus,
  }
}
