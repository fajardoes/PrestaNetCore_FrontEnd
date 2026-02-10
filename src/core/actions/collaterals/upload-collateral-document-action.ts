import type { ApiResult } from '@/core/helpers/api-result'
import type { UploadCollateralDocumentRequestDto } from '@/infrastructure/intranet/requests/collaterals/upload-collateral-document-request'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class UploadCollateralDocumentAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    collateralId: string,
    payload: UploadCollateralDocumentRequestDto,
  ): Promise<ApiResult<void, CollateralActionErrorData>> {
    try {
      await this.api.uploadCollateralDocument(collateralId, payload)
      return { success: true, data: undefined }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible subir el documento.')
    }
  }
}

const api = new CollateralsApi()
const action = new UploadCollateralDocumentAction(api)

export const uploadCollateralDocumentAction = (
  collateralId: string,
  payload: UploadCollateralDocumentRequestDto,
) => action.execute(collateralId, payload)
