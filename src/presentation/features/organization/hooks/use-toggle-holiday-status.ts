import { useCallback, useState } from 'react'
import { updateHolidayStatusAction } from '@/core/actions/organization/update-holiday-status.action'
import type { ApiResult } from '@/core/helpers/api-result'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'Conflicto: el registro cambió, refresca e intenta de nuevo.'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail ? `Validación: ${detail}` : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useToggleHolidayStatus = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStatus = useCallback(async (id: string, isActive: boolean) => {
    setIsLoading(true)
    setError(null)
    const result = await updateHolidayStatusAction(id, { isActive })
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsLoading(false)
    return result
  }, [])

  const clearError = () => setError(null)

  return {
    toggleStatus,
    isLoading,
    error,
    clearError,
  }
}
