import { updateLoanApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationUpdateRequest } from '@/infrastructure/loans/requests/loan-application-update-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class UpdateLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationUpdateRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await updateLoanApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible actualizar la solicitud de crédito.')
    }
  }
}

const action = new UpdateLoanApplicationAction()

export const updateLoanApplicationAction = (
  id: string,
  payload: LoanApplicationUpdateRequest,
) => action.execute(id, payload)
