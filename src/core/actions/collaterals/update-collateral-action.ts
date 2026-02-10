import type { ApiResult } from '@/core/helpers/api-result'
import type { UpdateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/update-collateral-request'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class UpdateCollateralAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    id: string,
    payload: UpdateCollateralRequestDto,
  ): Promise<ApiResult<CollateralResponseDto, CollateralActionErrorData>> {
    try {
      const data = await this.api.updateCollateral(id, payload)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible actualizar la garantía.')
    }
  }
}

const api = new CollateralsApi()
const action = new UpdateCollateralAction(api)

export const updateCollateralAction = (
  id: string,
  payload: UpdateCollateralRequestDto,
) => action.execute(id, payload)
