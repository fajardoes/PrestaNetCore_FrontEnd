import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriod } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { OpenPeriodRequest } from '@/infrastructure/interfaces/accounting/requests/open-period.request'

export const openPeriodAction = async (
  payload: OpenPeriodRequest,
): Promise<ApiResult<AccountingPeriod>> => {
  try {
    const result = await accountingApi.openPeriod(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible abrir el período. Verifica los datos ingresados.',
    )
  }
}
