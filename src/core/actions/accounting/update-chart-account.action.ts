import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ChartAccountDetail } from '@/infrastructure/interfaces/accounting/chart-account'
import type { UpdateChartAccountRequest } from '@/infrastructure/interfaces/accounting/requests/update-chart-account.request'

export const updateChartAccountAction = async (
  chartAccountId: string,
  payload: UpdateChartAccountRequest,
): Promise<ApiResult<ChartAccountDetail>> => {
  try {
    const updated = await accountingApi.updateChartAccount(chartAccountId, payload)
    return { success: true, data: updated }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la cuenta contable. Intenta nuevamente.',
    )
  }
}
