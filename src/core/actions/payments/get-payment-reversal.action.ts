import { getPaymentReversal } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'

export const getPaymentReversalAction = async (
  id: string,
): Promise<ApiResult<PaymentReversalResponse>> => {
  try {
    const result = await getPaymentReversal(id)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener la reversa del pago.')
  }
}
