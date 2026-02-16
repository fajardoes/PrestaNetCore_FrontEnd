import { submitApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationSubmitRequest } from '@/infrastructure/loans/requests/loan-application-submit-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class SubmitLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationSubmitRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await submitApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible enviar la solicitud de crédito.')
    }
  }
}

const action = new SubmitLoanApplicationAction()

export const submitLoanApplicationAction = (
  id: string,
  payload: LoanApplicationSubmitRequest,
) => action.execute(id, payload)
