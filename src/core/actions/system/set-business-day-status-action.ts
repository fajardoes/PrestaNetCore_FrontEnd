import { setBusinessDayStatus } from '@/core/api/system/business-date-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { BusinessDateStateDto } from '@/infrastructure/interfaces/system/business-date-state.dto'
import type { SetDayOpenRequestDto } from '@/infrastructure/interfaces/system/set-day-open-request.dto'

export const setBusinessDayStatusAction = async (
  payload: SetDayOpenRequestDto,
): Promise<ApiResult<BusinessDateStateDto>> => {
  try {
    const result = await setBusinessDayStatus(payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 404) {
      return toApiError(
        error,
        'Configuración de fecha operativa no inicializada.',
      )
    }
    if (status === 409) {
      return toApiError(
        error,
        'Conflicto: el registro cambió, refresca e intenta de nuevo.',
      )
    }
    if (status === 400) {
      return toApiError(
        error,
        'Validación: revisa los datos ingresados.',
      )
    }
    return toApiError(
      error,
      'No fue posible actualizar el estado del día.',
    )
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
