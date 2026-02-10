import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralCatalogItemCreateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-create-request'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class CreateCollateralStatusAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    payload: CollateralCatalogItemCreateRequestDto,
  ): Promise<ApiResult<CollateralCatalogItemDto, CollateralActionErrorData>> {
    try {
      const data = await this.api.createCollateralStatus(payload)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(
        error,
        'No fue posible crear el estado de garantía.',
      )
    }
  }
}

const api = new CollateralsApi()
const action = new CreateCollateralStatusAction(api)

export const createCollateralStatusAction = (
  payload: CollateralCatalogItemCreateRequestDto,
) => action.execute(payload)
