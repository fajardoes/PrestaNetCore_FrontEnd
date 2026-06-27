import { updateBankEntity } from '@/core/api/payments/bank-entities-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateBankEntityRequest } from '@/infrastructure/payments/requests/update-bank-entity-request'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

export const updateBankEntityAction = async (
  id: string,
  payload: UpdateBankEntityRequest,
): Promise<ApiResult<BankEntityResponse>> => {
  try {
    const result = await updateBankEntity(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar la entidad bancaria.')
  }
}
