import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class GetCollateralAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    id: string,
  ): Promise<ApiResult<CollateralResponseDto, CollateralActionErrorData>> {
    try {
      const data = await this.api.getCollateralById(id)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible cargar la garantía.')
    }
  }
}

const api = new CollateralsApi()
const action = new GetCollateralAction(api)

export const getCollateralAction = (id: string) => action.execute(id)
