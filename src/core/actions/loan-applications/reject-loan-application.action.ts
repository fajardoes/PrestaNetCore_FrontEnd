import { rejectApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationRejectRequest } from '@/infrastructure/loans/requests/loan-application-reject-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class RejectLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationRejectRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await rejectApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible rechazar la solicitud de crédito.')
    }
  }
}

const action = new RejectLoanApplicationAction()

export const rejectLoanApplicationAction = (
  id: string,
  payload: LoanApplicationRejectRequest,
) => action.execute(id, payload)
