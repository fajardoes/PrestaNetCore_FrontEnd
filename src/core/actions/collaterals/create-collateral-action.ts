import type { ApiResult } from '@/core/helpers/api-result'
import type { CreateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/create-collateral-request'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class CreateCollateralAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    payload: CreateCollateralRequestDto,
  ): Promise<ApiResult<CollateralResponseDto, CollateralActionErrorData>> {
    try {
      const data = await this.api.createCollateral(payload)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible crear la garantía.')
    }
  }
}

const api = new CollateralsApi()
const action = new CreateCollateralAction(api)

export const createCollateralAction = (payload: CreateCollateralRequestDto) =>
  action.execute(payload)
