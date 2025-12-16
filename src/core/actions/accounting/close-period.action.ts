import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriod } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { ClosePeriodRequest } from '@/infrastructure/interfaces/accounting/requests/close-period.request'

export const closePeriodAction = async (
  periodId: string,
  payload: ClosePeriodRequest,
): Promise<ApiResult<AccountingPeriod>> => {
  try {
    const result = await accountingApi.closePeriod(periodId, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible cerrar el período. Asegúrate de que esté abierto.',
    )
  }
}
