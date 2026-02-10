import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralCatalogItemUpdateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-update-request'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class UpdateCollateralStatusAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    id: string,
    payload: CollateralCatalogItemUpdateRequestDto,
  ): Promise<ApiResult<CollateralCatalogItemDto, CollateralActionErrorData>> {
    try {
      const data = await this.api.updateCollateralStatus(id, payload)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(
        error,
        'No fue posible actualizar el estado de garantía.',
      )
    }
  }
}

const api = new CollateralsApi()
const action = new UpdateCollateralStatusAction(api)

export const updateCollateralStatusAction = (
  id: string,
  payload: CollateralCatalogItemUpdateRequestDto,
) => action.execute(id, payload)
