import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ChartAccountDetail } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CreateChartAccountRequest } from '@/infrastructure/interfaces/accounting/requests/create-chart-account.request'

export const createChartAccountAction = async (
  payload: CreateChartAccountRequest,
): Promise<ApiResult<ChartAccountDetail>> => {
  try {
    const created = await accountingApi.createChartAccount(payload)
    return { success: true, data: created }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible crear la cuenta contable. Verifica los datos.',
    )
  }
}
