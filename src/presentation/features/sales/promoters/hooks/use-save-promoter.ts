import { useCallback, useState } from 'react'
import { createPromoterAction } from '@/core/actions/sales-promoters/create-promoter-action'
import { updatePromoterAction } from '@/core/actions/sales-promoters/update-promoter-action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { CreatePromoterRequest, UpdatePromoterRequest } from '@/infrastructure/interfaces/sales/promoter'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'El codigo ya existe.'
  }
  if (result.status === 422) {
    return result.error?.trim()
      ? `Validacion: ${result.error}`
      : 'Validacion: revisa los datos ingresados.'
  }
  if (result.status === 404) {
    return 'No se encontro el promotor solicitado.'
  }
  return result.error
}

export const useSavePromoter = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: CreatePromoterRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await createPromoterAction(payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const update = useCallback(
    async (id: string, payload: UpdatePromoterRequest) => {
      setIsSaving(true)
      setError(null)
      const result = await updatePromoterAction(id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [],
  )

  const toggleStatus = useCallback(
    async (
      id: string,
      agencyId: string,
      isActive: boolean,
    ): Promise<ApiResult<void>> => {
      setIsSaving(true)
      setError(null)
      const payload: UpdatePromoterRequest = { agencyId, isActive }
      const result = await updatePromoterAction(id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      if (result.success) {
        return { success: true, data: undefined }
      }
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
