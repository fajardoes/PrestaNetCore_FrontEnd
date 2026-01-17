import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClosePeriodResult } from '@/infrastructure/interfaces/accounting/close-period-result'
import type { ClosePeriodRequest } from '@/infrastructure/interfaces/accounting/requests/close-period.request'

export const closePeriodAction = async (
  periodId: string,
  payload: ClosePeriodRequest,
): Promise<ApiResult<ClosePeriodResult>> => {
  try {
    const result = await accountingApi.closePeriod(periodId, payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 404) {
      return toApiError(error, 'Período no encontrado.')
    }
    if (status === 409) {
      return toApiError(
        error,
        'No se pudo completar la operación. Verifica el estado del período.',
      )
    }
    return toApiError(
      error,
      'No fue posible cerrar el período. Asegúrate de que esté abierto.',
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
