import type { ApiResult } from '@/core/helpers/api-result'
import type { PatchCollateralCatalogItemStatusRequestDto } from '@/infrastructure/intranet/requests/collaterals/patch-collateral-catalog-item-status-request'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class PatchCollateralStatusStatusAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    id: string,
    payload: PatchCollateralCatalogItemStatusRequestDto,
  ): Promise<ApiResult<void, CollateralActionErrorData>> {
    try {
      await this.api.patchCollateralStatusStatus(id, payload)
      return { success: true, data: undefined }
    } catch (error) {
      return toCollateralApiError(
        error,
        'No fue posible actualizar el estado del catálogo de estados.',
      )
    }
  }
}

const api = new CollateralsApi()
const action = new PatchCollateralStatusStatusAction(api)

export const patchCollateralStatusStatusAction = (
  id: string,
  payload: PatchCollateralCatalogItemStatusRequestDto,
) => action.execute(id, payload)
