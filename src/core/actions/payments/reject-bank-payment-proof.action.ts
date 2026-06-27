import { rejectBankPaymentProof } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { RejectBankPaymentProofRequest } from '@/infrastructure/payments/requests/reject-bank-payment-proof-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const rejectBankPaymentProofAction = async (
  id: string,
  payload: RejectBankPaymentProofRequest,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await rejectBankPaymentProof(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible rechazar el abono bancario.')
  }
}
