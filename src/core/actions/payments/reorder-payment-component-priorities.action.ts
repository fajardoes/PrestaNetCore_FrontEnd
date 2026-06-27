import { reorderPaymentComponentPriorities } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ReorderPaymentComponentPrioritiesRequest } from '@/infrastructure/payments/requests/reorder-payment-component-priorities-request'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'

export const reorderPaymentComponentPrioritiesAction = async (
  payload: ReorderPaymentComponentPrioritiesRequest,
): Promise<ApiResult<PaymentComponentPriorityResponse[]>> => {
  try {
    const result = await reorderPaymentComponentPriorities(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible reordenar las prioridades de cobro.',
    )
  }
}
