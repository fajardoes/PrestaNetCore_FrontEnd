import { useCallback, useState } from 'react'
import { createHolidayAction } from '@/core/actions/organization/create-holiday.action'
import { updateHolidayAction } from '@/core/actions/organization/update-holiday.action'
import type { HolidayCreateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-create.dto'
import type { HolidayUpdateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-update.dto'
import type { ApiResult } from '@/core/helpers/api-result'

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'Conflicto: el registro cambió o ya existe un feriado con esa fecha.'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail ? `Validación: ${detail}` : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useSaveHoliday = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: HolidayCreateDto) => {
    setIsSaving(true)
    setError(null)
    const result = await createHolidayAction(payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const update = useCallback(async (id: string, payload: HolidayUpdateDto) => {
    setIsSaving(true)
    setError(null)
    const result = await updateHolidayAction(id, payload)
    if (!result.success) {
      setError(mapErrorMessage(result))
    }
    setIsSaving(false)
    return result
  }, [])

  const clearError = () => setError(null)

  return {
    create,
    update,
    isSaving,
    error,
    clearError,
  }
}
