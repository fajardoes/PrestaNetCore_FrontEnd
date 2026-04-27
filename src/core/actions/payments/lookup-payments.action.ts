import { lookupPayments } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { PaymentLookupResponse } from '@/infrastructure/payments/responses/payment-lookup-response'

interface LookupPaymentsParams {
  clientIdentityNo?: string
  loanNo?: string
}

export const lookupPaymentsAction = async (
  params: LookupPaymentsParams,
): Promise<ApiResult<PaymentLookupResponse>> => {
  try {
    const result = await lookupPayments(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar los préstamos para pago.')
  }
}
