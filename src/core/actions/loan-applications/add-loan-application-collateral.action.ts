import { addCollateral } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCollateralAddRequest } from '@/infrastructure/loans/requests/loan-application-collateral-add-request'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'

export class AddLoanApplicationCollateralAction {
  async execute(
    applicationId: string,
    payload: LoanApplicationCollateralAddRequest,
  ): Promise<ApiResult<LoanApplicationCollateralResponse>> {
    try {
      const data = await addCollateral(applicationId, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible agregar la garantía a la solicitud.')
    }
  }
}

const action = new AddLoanApplicationCollateralAction()

export const addLoanApplicationCollateralAction = (
  applicationId: string,
  payload: LoanApplicationCollateralAddRequest,
) => action.execute(applicationId, payload)
