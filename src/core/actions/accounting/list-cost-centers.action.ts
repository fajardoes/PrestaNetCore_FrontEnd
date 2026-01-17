import { accountingApi, type CostCenterFilters } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { PagedResponse } from '@/infrastructure/interfaces/accounting/paged-response'

export const listCostCentersAction = async (
  filters: CostCenterFilters,
): Promise<ApiResult<PagedResponse<CostCenter>>> => {
  try {
    const result = await accountingApi.getCostCenters(filters)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los centros de costo.')
  }
}
