import { refreshLoanApplicationProductConditions } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class RefreshLoanApplicationProductConditionsAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await refreshLoanApplicationProductConditions(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible refrescar las condiciones del producto.')
    }
  }
}

const action = new RefreshLoanApplicationProductConditionsAction()

export const refreshLoanApplicationProductConditionsAction = (id: string) =>
  action.execute(id)
