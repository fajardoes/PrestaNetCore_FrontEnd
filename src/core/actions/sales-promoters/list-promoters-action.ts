import { promotersApi } from '@/core/api/sales/promoters-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PromoterResponse, PromotersSearchRequest } from '@/infrastructure/interfaces/sales/promoter'
import type { PagedResult } from '@/types/pagination'

export const listPromotersAction = async (
  filters: PromotersSearchRequest,
): Promise<ApiResult<PagedResult<PromoterResponse>>> => {
  try {
    const promoters = await promotersApi.list(filters)
    return { success: true, data: promoters }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los promotores.')
  }
}
