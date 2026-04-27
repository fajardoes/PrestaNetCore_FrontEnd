import { reversePayment } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ReversePaymentRequest } from '@/infrastructure/payments/requests/reverse-payment-request'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'

export const reversePaymentAction = async (
  id: string,
  payload: ReversePaymentRequest,
): Promise<ApiResult<PaymentReversalResponse>> => {
  try {
    const result = await reversePayment(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible reversar el pago.')
  }
}
