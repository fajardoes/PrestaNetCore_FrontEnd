import { updateHoliday } from '@/core/api/organization/holidays-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { HolidayDetailDto } from '@/infrastructure/interfaces/organization/holidays/holiday-detail.dto'
import type { HolidayUpdateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-update.dto'

export const updateHolidayAction = async (
  id: string,
  payload: HolidayUpdateDto,
): Promise<ApiResult<HolidayDetailDto>> => {
  try {
    const result = await updateHoliday(id, payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 404) {
      return toApiError(error, 'Feriado no encontrado.')
    }
    if (status === 409) {
      return toApiError(error, 'Conflicto: el registro cambió, refresca e intenta de nuevo.')
    }
    if (status === 400) {
      return toApiError(error, 'Validación: revisa los datos ingresados.')
    }
    return toApiError(error, 'No fue posible actualizar el feriado.')
  }
}

const getAxiosStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  ) {
    return (error as { response?: { status?: number } }).response?.status
  }
  return undefined
}
