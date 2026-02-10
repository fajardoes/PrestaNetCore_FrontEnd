import { useCallback, useState } from 'react'
import { createDelinquencyPolicyAction } from '@/core/actions/loans-delinquency-policy/create-delinquency-policy.action'
import { updateDelinquencyPolicyAction } from '@/core/actions/loans-delinquency-policy/update-delinquency-policy.action'
import { updateDelinquencyPolicyStatusAction } from '@/core/actions/loans-delinquency-policy/update-delinquency-policy-status.action'
import type { CreateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy.request'
import type { UpdateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy.request'
import type { UpdateDelinquencyPolicyStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-status.request'
import type { ApiResult } from '@/core/helpers/api-result'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'Ya existe una política con ese código.'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail
      ? `Validación: ${detail}`
      : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useDelinquencyPolicyMutations = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: CreateDelinquencyPolicyRequestDto) => {
    setIsSaving(true)
    setError(null)
    const result = await createDelinquencyPolicyAction(payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const update = useCallback(
    async (id: string, payload: UpdateDelinquencyPolicyRequestDto) => {
      setIsSaving(true)
      setError(null)
      const result = await updateDelinquencyPolicyAction(id, payload)
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
      const payload: UpdateDelinquencyPolicyStatusRequestDto = { isActive }
      const result = await updateDelinquencyPolicyStatusAction(id, payload)
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
