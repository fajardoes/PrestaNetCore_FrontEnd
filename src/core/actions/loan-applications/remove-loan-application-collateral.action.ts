import { removeCollateral } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export class RemoveLoanApplicationCollateralAction {
  async execute(applicationId: string, linkId: string): Promise<ApiResult<void>> {
    try {
      await removeCollateral(applicationId, linkId)
      return { success: true, data: undefined }
    } catch (error) {
      return toApiError(error, 'No fue posible eliminar la garantía vinculada.')
    }
  }
}

const action = new RemoveLoanApplicationCollateralAction()

export const removeLoanApplicationCollateralAction = (
  applicationId: string,
  linkId: string,
) => action.execute(applicationId, linkId)
