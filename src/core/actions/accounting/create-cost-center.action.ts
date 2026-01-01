import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { CreateCostCenterRequest } from '@/infrastructure/interfaces/accounting/requests/create-cost-center.request'

export const createCostCenterAction = async (
  payload: CreateCostCenterRequest,
): Promise<ApiResult<CostCenter>> => {
  try {
    const created = await accountingApi.createCostCenter(payload)
    return { success: true, data: created }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible crear el centro de costo. Verifica la información.',
    )
  }
}
