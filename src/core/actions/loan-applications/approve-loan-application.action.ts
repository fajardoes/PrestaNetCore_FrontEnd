import { approveApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationApproveRequest } from '@/infrastructure/loans/requests/loan-application-approve-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class ApproveLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationApproveRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await approveApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible aprobar la solicitud de crédito.')
    }
  }
}

const action = new ApproveLoanApplicationAction()

export const approveLoanApplicationAction = (
  id: string,
  payload: LoanApplicationApproveRequest,
) => action.execute(id, payload)
