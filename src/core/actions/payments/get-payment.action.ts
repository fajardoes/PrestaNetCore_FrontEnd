import { getPayment } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const getPaymentAction = async (
  id: string,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await getPayment(id)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el detalle del pago.')
  }
}
