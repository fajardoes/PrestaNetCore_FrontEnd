import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralDocumentResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-document-response'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class ListCollateralDocumentsAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    collateralId: string,
  ): Promise<ApiResult<CollateralDocumentResponseDto[], CollateralActionErrorData>> {
    try {
      const data = await this.api.getCollateralDocuments(collateralId)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(
        error,
        'No fue posible cargar los documentos de la garantía.',
      )
    }
  }
}

const api = new CollateralsApi()
const action = new ListCollateralDocumentsAction(api)

export const listCollateralDocumentsAction = (collateralId: string) =>
  action.execute(collateralId)
