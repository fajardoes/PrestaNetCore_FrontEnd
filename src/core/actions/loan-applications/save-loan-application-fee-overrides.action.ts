import { saveLoanApplicationFeeOverrides } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFeeOverridesUpsertRequest } from '@/infrastructure/loans/requests/loan-application-fee-overrides-upsert-request'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'

export class SaveLoanApplicationFeeOverridesAction {
  async execute(
    id: string,
    payload: LoanApplicationFeeOverridesUpsertRequest,
  ): Promise<ApiResult<LoanApplicationFeeResponse[]>> {
    try {
      const data = await saveLoanApplicationFeeOverrides(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible guardar las comisiones de la solicitud.')
    }
  }
}

const action = new SaveLoanApplicationFeeOverridesAction()

export const saveLoanApplicationFeeOverridesAction = (
  id: string,
  payload: LoanApplicationFeeOverridesUpsertRequest,
) => action.execute(id, payload)
