import { cancelApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCancelRequest } from '@/infrastructure/loans/requests/loan-application-cancel-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class CancelLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationCancelRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await cancelApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible cancelar la solicitud de crédito.')
    }
  }
}

const action = new CancelLoanApplicationAction()

export const cancelLoanApplicationAction = (
  id: string,
  payload: LoanApplicationCancelRequest,
) => action.execute(id, payload)
