import { getBankEntity } from '@/core/api/payments/bank-entities-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

export const getBankEntityAction = async (
  id: string,
): Promise<ApiResult<BankEntityResponse>> => {
  try {
    const result = await getBankEntity(id)
    return { success: true, data: result }
  } catch (error) {
    const apiError = toApiError(error, 'No fue posible obtener la entidad bancaria.')
    if (apiError.status === 404) {
      return {
        ...apiError,
        error: 'La entidad bancaria no existe o no está disponible para tu usuario.',
      }
    }
    return apiError
  }
}
