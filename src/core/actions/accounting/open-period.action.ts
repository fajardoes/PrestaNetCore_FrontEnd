import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { OpenPeriodRequest } from '@/infrastructure/interfaces/accounting/requests/open-period.request'

export const openPeriodAction = async (
  payload: OpenPeriodRequest,
): Promise<ApiResult<AccountingPeriodDto>> => {
  try {
    const result = await accountingApi.openPeriod(payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 409) {
      return toApiError(
        error,
        'Ya existe un período abierto. Para continuar, cierre el período vigente.',
      )
    }
    return toApiError(error, 'No fue posible abrir el período. Verifica los datos ingresados.')
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
