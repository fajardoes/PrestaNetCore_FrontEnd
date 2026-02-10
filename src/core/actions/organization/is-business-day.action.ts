import { isBusinessDay } from '@/core/api/organization/business-calendar-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { IsBusinessDayResponseDto } from '@/infrastructure/interfaces/organization/holidays/is-business-day-response.dto'

interface IsBusinessDayParams {
  date: string
  agencyId?: string
  portfolioTypeId?: string
}

export const isBusinessDayAction = async (
  params: IsBusinessDayParams,
): Promise<ApiResult<IsBusinessDayResponseDto>> => {
  try {
    const result = await isBusinessDay(params)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 400) {
      return toApiError(error, 'Validación: revisa los datos ingresados.')
    }
    if (status === 404) {
      return toApiError(error, 'No se encontró información para validar el día hábil.')
    }
    if (status === 409) {
      return toApiError(error, 'Conflicto: no se pudo resolver el día hábil.')
    }
    return toApiError(error, 'No fue posible validar el día hábil.')
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
