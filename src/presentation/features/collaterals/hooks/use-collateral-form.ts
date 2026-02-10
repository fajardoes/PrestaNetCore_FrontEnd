import { useCallback, useState } from 'react'
import { createCollateralAction } from '@/core/actions/collaterals/create-collateral-action'
import { updateCollateralAction } from '@/core/actions/collaterals/update-collateral-action'
import type { CreateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/create-collateral-request'
import type { UpdateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/update-collateral-request'
import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

const mapErrorMessage = (result: ApiResult<unknown, CollateralActionErrorData>) => {
  if (result.success) return null
  if (result.status === 404) return 'No encontrado.'
  if (result.status === 409) return result.error || 'Conflicto al guardar.'
  if (result.status === 422) return result.error || 'Datos inválidos. Revisa el formulario.'
  return result.error
}

export const useCollateralForm = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorsByField, setErrorsByField] = useState<Record<string, string[]>>({})

  const create = useCallback(async (payload: CreateCollateralRequestDto) => {
    setIsSaving(true)
    setError(null)
    setErrorsByField({})

    const result = await createCollateralAction(payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
      setErrorsByField(result.data?.errorsByField ?? {})
    }

    setIsSaving(false)
    return result
  }, [])

  const update = useCallback(
    async (id: string, payload: UpdateCollateralRequestDto) => {
      setIsSaving(true)
      setError(null)
      setErrorsByField({})

      const result = await updateCollateralAction(id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
        setErrorsByField(result.data?.errorsByField ?? {})
      }

      setIsSaving(false)
      return result
    },
    [],
  )

  return {
    isSaving,
    error,
    errorsByField,
    create,
    update,
    clearError: () => {
      setError(null)
      setErrorsByField({})
    },
  }
}
