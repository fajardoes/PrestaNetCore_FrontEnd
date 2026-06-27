import { getLoanApplicationFinancialProfile } from '@/core/api/loans/loan-application-financial-profile-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'

export class GetLoanApplicationFinancialProfileAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationFinancialProfileResponse>> {
    try {
      const data = await getLoanApplicationFinancialProfile(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener la ficha financiera.')
    }
  }
}

const action = new GetLoanApplicationFinancialProfileAction()

export const getLoanApplicationFinancialProfileAction = (id: string) => action.execute(id)
