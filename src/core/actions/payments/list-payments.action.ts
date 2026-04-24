import { listPayments } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ListPaymentsRequest } from '@/infrastructure/payments/requests/list-payments-request'
import type { PaymentListResponse } from '@/infrastructure/payments/responses/payment-list-response'

export const listPaymentsAction = async (
  params: ListPaymentsRequest,
): Promise<ApiResult<PaymentListResponse>> => {
  try {
    const result = await listPayments(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar los pagos.')
  }
}
