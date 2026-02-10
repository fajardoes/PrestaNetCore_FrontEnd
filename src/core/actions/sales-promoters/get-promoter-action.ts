import { promotersApi } from '@/core/api/sales/promoters-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'

export const getPromoterAction = async (
  id: string,
): Promise<ApiResult<PromoterResponse>> => {
  try {
    const promoter = await promotersApi.getById(id)
    return { success: true, data: promoter }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el promotor.')
  }
}
