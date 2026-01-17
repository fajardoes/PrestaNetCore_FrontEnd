import { accountingApi, type ChartAccountFilters } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { PagedResponse } from '@/infrastructure/interfaces/accounting/paged-response'

export const listChartAccountsAction = async (
  filters: ChartAccountFilters,
): Promise<ApiResult<PagedResponse<ChartAccountListItem>>> => {
  try {
    const result = await accountingApi.getChartAccounts(filters)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el plan de cuentas.')
  }
}
