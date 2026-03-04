import { returnLoanApplicationToDraft } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationReturnToDraftRequest } from '@/infrastructure/loans/requests/loan-application-return-to-draft-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class ReturnLoanApplicationToDraftAction {
  async execute(
    id: string,
    payload: LoanApplicationReturnToDraftRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await returnLoanApplicationToDraft(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(
        error,
        'No fue posible devolver la solicitud a borrador.',
      )
    }
  }
}

const action = new ReturnLoanApplicationToDraftAction()

export const returnLoanApplicationToDraftAction = (
  id: string,
  payload: LoanApplicationReturnToDraftRequest,
) => action.execute(id, payload)
