import { createHoliday } from '@/core/api/organization/holidays-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { HolidayDetailDto } from '@/infrastructure/interfaces/organization/holidays/holiday-detail.dto'
import type { HolidayCreateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-create.dto'

export const createHolidayAction = async (
  payload: HolidayCreateDto,
): Promise<ApiResult<HolidayDetailDto>> => {
  try {
    const result = await createHoliday(payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 409) {
      return toApiError(error, 'Ya existe un feriado con esa fecha.')
    }
    if (status === 400) {
      return toApiError(error, 'Validación: revisa los datos ingresados.')
    }
    return toApiError(error, 'No fue posible crear el feriado.')
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
