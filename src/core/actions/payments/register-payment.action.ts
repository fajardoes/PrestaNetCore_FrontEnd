import { registerPayment } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { RegisterPaymentRequest } from '@/infrastructure/payments/requests/register-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const registerPaymentAction = async (
  payload: RegisterPaymentRequest,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await registerPayment(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible registrar el pago.')
  }
}
