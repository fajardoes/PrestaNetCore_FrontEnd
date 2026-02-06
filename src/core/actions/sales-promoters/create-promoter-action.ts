import { promotersApi } from '@/core/api/sales/promoters-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreatePromoterRequest, PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'

export const createPromoterAction = async (
  payload: CreatePromoterRequest,
): Promise<ApiResult<PromoterResponse>> => {
  try {
    const promoter = await promotersApi.create(payload)
    return { success: true, data: promoter }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el promotor.')
  }
}
