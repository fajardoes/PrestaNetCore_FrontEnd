import { getLoanApplicationFees } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'

export class GetLoanApplicationFeesAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationFeeResponse[]>> {
    try {
      const data = await getLoanApplicationFees(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener las comisiones de la solicitud.')
    }
  }
}

const action = new GetLoanApplicationFeesAction()

export const getLoanApplicationFeesAction = (id: string) => action.execute(id)
