import { updateBankEntityStatus } from '@/core/api/payments/bank-entities-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateBankEntityStatusRequest } from '@/infrastructure/payments/requests/update-bank-entity-status-request'

export const updateBankEntityStatusAction = async (
  id: string,
  payload: UpdateBankEntityStatusRequest,
): Promise<ApiResult<void>> => {
  try {
    await updateBankEntityStatus(id, payload)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el estado de la entidad bancaria.')
  }
}
