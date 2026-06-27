import { listBankEntities } from '@/core/api/payments/bank-entities-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ListBankEntitiesRequest } from '@/infrastructure/payments/requests/list-bank-entities-request'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

export const listBankEntitiesAction = async (
  params: ListBankEntitiesRequest,
): Promise<ApiResult<BankEntityResponse[]>> => {
  try {
    const result = await listBankEntities(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener las entidades bancarias.')
  }
}
