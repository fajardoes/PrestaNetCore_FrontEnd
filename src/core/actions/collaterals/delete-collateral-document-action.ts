import type { ApiResult } from '@/core/helpers/api-result'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class DeleteCollateralDocumentAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    collateralId: string,
    documentId: string,
  ): Promise<ApiResult<void, CollateralActionErrorData>> {
    try {
      await this.api.deleteCollateralDocument(collateralId, documentId)
      return { success: true, data: undefined }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible eliminar el documento.')
    }
  }
}

const api = new CollateralsApi()
const action = new DeleteCollateralDocumentAction(api)

export const deleteCollateralDocumentAction = (
  collateralId: string,
  documentId: string,
) => action.execute(collateralId, documentId)
