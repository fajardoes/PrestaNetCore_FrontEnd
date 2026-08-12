import { setLoanApplicationFirstDueDate } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFirstDueDateRequest } from '@/infrastructure/loans/requests/loan-application-first-due-date-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class SetLoanApplicationFirstDueDateAction {
  async execute(
    id: string,
    payload: LoanApplicationFirstDueDateRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await setLoanApplicationFirstDueDate(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible guardar la primera fecha de cuota.')
    }
  }
}

const action = new SetLoanApplicationFirstDueDateAction()

export const setLoanApplicationFirstDueDateAction = (
  id: string,
  payload: LoanApplicationFirstDueDateRequest,
) => action.execute(id, payload)
