import { getLoanApplication } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export class GetLoanApplicationAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationResponse>> {
    try {
      const data = await getLoanApplication(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener la solicitud de crédito.')
    }
  }
}

const action = new GetLoanApplicationAction()

export const getLoanApplicationAction = (id: string) => action.execute(id)
