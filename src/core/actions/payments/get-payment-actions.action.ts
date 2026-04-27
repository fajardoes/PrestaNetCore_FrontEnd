import { getPaymentActions } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'

export const getPaymentActionsAction = async (
  id: string,
): Promise<ApiResult<PaymentActionsResponse>> => {
  try {
    const result = await getPaymentActions(id)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener las acciones del pago.')
  }
}
