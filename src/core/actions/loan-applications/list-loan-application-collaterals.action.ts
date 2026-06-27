import { listCollaterals } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'

export class ListLoanApplicationCollateralsAction {
  async execute(
    applicationId: string,
  ): Promise<ApiResult<LoanApplicationCollateralResponse[]>> {
    try {
      const data = await listCollaterals(applicationId)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener las garantías vinculadas.')
    }
  }
}

const action = new ListLoanApplicationCollateralsAction()

export const listLoanApplicationCollateralsAction = (applicationId: string) =>
  action.execute(applicationId)
