import { disburseApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationDisburseRequest } from '@/infrastructure/loans/requests/loan-application-disburse-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class DisburseLoanApplicationAction {
  async execute(
    id: string,
    payload: LoanApplicationDisburseRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await disburseApplication(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible desembolsar la solicitud de crédito.')
    }
  }
}

const action = new DisburseLoanApplicationAction()

export const disburseLoanApplicationAction = (
  id: string,
  payload: LoanApplicationDisburseRequest,
) => action.execute(id, payload)
