import { deactivatePaymentComponentPriority } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deactivatePaymentComponentPriorityAction = async (
  id: string,
): Promise<ApiResult<void>> => {
  try {
    await deactivatePaymentComponentPriority(id)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible desactivar la prioridad de cobro.',
    )
  }
}
