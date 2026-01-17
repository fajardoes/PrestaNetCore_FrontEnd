import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ChartAccountDetail } from '@/infrastructure/interfaces/accounting/chart-account'

export const getChartAccountAction = async (
  chartAccountId: string,
): Promise<ApiResult<ChartAccountDetail>> => {
  try {
    const chartAccount = await accountingApi.getChartAccountById(chartAccountId)
    return { success: true, data: chartAccount }
  } catch (error) {
    return toApiError(error, 'No fue posible cargar la cuenta contable.')
  }
}
