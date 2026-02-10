import { promotersApi } from '@/core/api/sales/promoters-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PromoterResponse, UpdatePromoterRequest } from '@/infrastructure/interfaces/sales/promoter'

export const updatePromoterAction = async (
  id: string,
  payload: UpdatePromoterRequest,
): Promise<ApiResult<PromoterResponse>> => {
  try {
    const promoter = await promotersApi.update(id, payload)
    return { success: true, data: promoter }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el promotor.')
  }
}
