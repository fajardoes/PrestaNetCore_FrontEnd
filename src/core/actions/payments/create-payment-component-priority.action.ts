import { createPaymentComponentPriority } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/create-payment-component-priority-request'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'

export const createPaymentComponentPriorityAction = async (
  payload: CreatePaymentComponentPriorityRequest,
): Promise<ApiResult<PaymentComponentPriorityResponse>> => {
  try {
    const result = await createPaymentComponentPriority(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible crear la prioridad de cobro.')
  }
}
