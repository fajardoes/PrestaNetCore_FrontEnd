import { updatePaymentComponentPriority } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/update-payment-component-priority-request'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'

export const updatePaymentComponentPriorityAction = async (
  id: string,
  payload: UpdatePaymentComponentPriorityRequest,
): Promise<ApiResult<PaymentComponentPriorityResponse>> => {
  try {
    const result = await updatePaymentComponentPriority(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la prioridad de cobro.',
    )
  }
}
