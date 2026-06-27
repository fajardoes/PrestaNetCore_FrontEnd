import { registerBankPaymentProof } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { RegisterBankPaymentProofRequest } from '@/infrastructure/payments/requests/register-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const registerBankPaymentProofAction = async (
  payload: RegisterBankPaymentProofRequest,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await registerBankPaymentProof(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible registrar el abono bancario.')
  }
}
