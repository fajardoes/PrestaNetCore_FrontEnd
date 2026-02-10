import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class ListCollateralTypesAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    active?: boolean,
  ): Promise<ApiResult<CollateralCatalogItemDto[], CollateralActionErrorData>> {
    try {
      const data = await this.api.getCollateralTypes(active)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(
        error,
        'No fue posible cargar los tipos de garantía.',
      )
    }
  }
}

const api = new CollateralsApi()
const action = new ListCollateralTypesAction(api)

export const listCollateralTypesAction = (active?: boolean) =>
  action.execute(active)
