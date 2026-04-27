import { effectivizePayment } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const effectivizePaymentAction = async (
  id: string,
  payload: EffectivizePaymentRequest,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await effectivizePayment(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible efectivizar el pago.')
  }
}
