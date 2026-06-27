import { approveBankPaymentProof } from '@/core/api/payments/payments-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ApproveBankPaymentProofRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

export const approveBankPaymentProofAction = async (
  id: string,
  payload: ApproveBankPaymentProofRequest,
): Promise<ApiResult<PaymentResponse>> => {
  try {
    const result = await approveBankPaymentProof(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible aprobar el abono bancario.')
  }
}
