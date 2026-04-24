import { listPaymentComponentPriorities } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'

export const listPaymentComponentPrioritiesAction = async (): Promise<
  ApiResult<PaymentComponentPriorityResponse[]>
> => {
  try {
    const result = await listPaymentComponentPriorities()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible obtener las prioridades de cobro.',
    )
  }
}
