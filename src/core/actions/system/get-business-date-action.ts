import { getBusinessDate } from '@/core/api/system/business-date-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { BusinessDateStateDto } from '@/infrastructure/interfaces/system/business-date-state.dto'

export const getBusinessDateAction = async (): Promise<
  ApiResult<BusinessDateStateDto>
> => {
  try {
    const result = await getBusinessDate()
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
    return toApiError(error, 'No fue posible obtener la fecha operativa.')
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
