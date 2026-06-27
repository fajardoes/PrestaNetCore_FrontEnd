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
    const apiError = toApiError(error, 'No fue posible obtener el detalle del pago.')
    if (apiError.status === 404) {
      return {
        ...apiError,
        error: 'El pago no existe o no está dentro de tu alcance de consulta.',
      }
    }
    return apiError
  }
}
