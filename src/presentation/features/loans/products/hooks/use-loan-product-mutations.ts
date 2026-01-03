import { useCallback, useState } from 'react'
import { createLoanProductAction } from '@/core/actions/loans/create-loan-product.action'
import { updateLoanProductAction } from '@/core/actions/loans/update-loan-product.action'
import { updateLoanProductStatusAction } from '@/core/actions/loans/update-loan-product-status.action'
import type { LoanProductCreateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-create.dto'
import type { LoanProductUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-update.dto'
import type { LoanProductStatusUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-status-update.dto'
import type { ApiResult } from '@/core/helpers/api-result'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'El código ya existe'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail
      ? `Validación: ${detail}`
      : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useLoanProductMutations = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: LoanProductCreateDto) => {
    setIsSaving(true)
    setError(null)
    const result = await createLoanProductAction(payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const update = useCallback(async (id: string, payload: LoanProductUpdateDto) => {
    setIsSaving(true)
    setError(null)
    const result = await updateLoanProductAction(id, payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const toggleStatus = useCallback(
    async (id: string, isActive: boolean): Promise<ApiResult<void>> => {
      setIsSaving(true)
      setError(null)
      const payload: LoanProductStatusUpdateDto = { isActive }
      const result = await updateLoanProductStatusAction(id, payload)
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
