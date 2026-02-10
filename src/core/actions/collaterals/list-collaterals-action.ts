import type { ApiResult } from '@/core/helpers/api-result'
import type { GetCollateralsRequestDto } from '@/infrastructure/intranet/requests/collaterals/get-collaterals-request'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import type { PagedResultDto } from '@/infrastructure/intranet/responses/collaterals/paged-result'
import { CollateralsApi } from '@/infrastructure/intranet/collaterals/collaterals-api'
import { toCollateralApiError, type CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

export class ListCollateralsAction {
  private api: CollateralsApi

  constructor(api: CollateralsApi) {
    this.api = api
  }

  async execute(
    query: GetCollateralsRequestDto,
  ): Promise<ApiResult<PagedResultDto<CollateralResponseDto>, CollateralActionErrorData>> {
    try {
      const data = await this.api.getCollaterals(query)
      return { success: true, data }
    } catch (error) {
      return toCollateralApiError(error, 'No fue posible cargar las garantías.')
    }
  }
}

const api = new CollateralsApi()
const action = new ListCollateralsAction(api)

export const listCollateralsAction = (query: GetCollateralsRequestDto) =>
  action.execute(query)
