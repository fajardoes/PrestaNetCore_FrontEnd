import { adjustDate } from '@/core/api/organization/business-calendar-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AdjustDateRequestDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-request.dto'
import type { AdjustDateResponseDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-response.dto'

export const adjustBusinessDateAction = async (
  payload: AdjustDateRequestDto,
): Promise<ApiResult<AdjustDateResponseDto>> => {
  try {
    const result = await adjustDate(payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 400) {
      return toApiError(error, 'Validación: revisa los datos ingresados.')
    }
    if (status === 404) {
      return toApiError(error, 'No se encontró información para ajustar la fecha.')
    }
    if (status === 409) {
      return toApiError(error, 'Conflicto: no fue posible ajustar la fecha, intenta con otra fecha.')
    }
    return toApiError(error, 'No fue posible ajustar la fecha.')
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
