import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const syncCostCentersAction = async (): Promise<ApiResult<{ succeeded: boolean }>> => {
  try {
    const result = await accountingApi.syncCostCentersWithAgencies()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible sincronizar los centros de costo con las agencias.',
    )
  }
}
