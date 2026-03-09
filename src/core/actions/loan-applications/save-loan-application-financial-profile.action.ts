import { saveLoanApplicationFinancialProfile } from '@/core/api/loans/loan-application-financial-profile-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFinancialProfileUpsertRequest } from '@/infrastructure/loans/requests/loan-application-financial-profile-upsert-request'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'

export class SaveLoanApplicationFinancialProfileAction {
  async execute(
    id: string,
    payload: LoanApplicationFinancialProfileUpsertRequest,
  ): Promise<ApiResult<LoanApplicationFinancialProfileResponse>> {
    try {
      const data = await saveLoanApplicationFinancialProfile(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible guardar la ficha financiera.')
    }
  }
}

const action = new SaveLoanApplicationFinancialProfileAction()

export const saveLoanApplicationFinancialProfileAction = (
  id: string,
  payload: LoanApplicationFinancialProfileUpsertRequest,
) => action.execute(id, payload)
