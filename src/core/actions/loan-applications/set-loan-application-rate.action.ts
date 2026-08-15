import { setLoanApplicationRate } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationRateOverrideRequest } from '@/infrastructure/loans/requests/loan-application-rate-override-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class SetLoanApplicationRateAction {
  async execute(
    id: string,
    payload: LoanApplicationRateOverrideRequest,
  ): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await setLoanApplicationRate(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible guardar la tasa nominal de la solicitud.')
    }
  }
}

const action = new SetLoanApplicationRateAction()

export const setLoanApplicationRateAction = (
  id: string,
  payload: LoanApplicationRateOverrideRequest,
) => action.execute(id, payload)
