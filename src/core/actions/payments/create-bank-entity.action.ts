import { createBankEntity } from '@/core/api/payments/bank-entities-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreateBankEntityRequest } from '@/infrastructure/payments/requests/create-bank-entity-request'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

export const createBankEntityAction = async (
  payload: CreateBankEntityRequest,
): Promise<ApiResult<BankEntityResponse>> => {
  try {
    const result = await createBankEntity(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible crear la entidad bancaria.')
  }
}
