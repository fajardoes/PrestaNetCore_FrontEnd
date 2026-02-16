import { createLoanApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreateRequest } from '@/infrastructure/loans/requests/loan-application-create-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class CreateLoanApplicationAction {
  async execute(
    payload: LoanApplicationCreateRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await createLoanApplication(payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible crear la solicitud de crédito.')
    }
  }
}

const action = new CreateLoanApplicationAction()

export const createLoanApplicationAction = (payload: LoanApplicationCreateRequest) =>
  action.execute(payload)
