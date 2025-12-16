import {
  clientesApi,
  type EconomicActivityFilters,
} from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import type { PagedResult } from '@/types/pagination'

export const listEconomicActivitiesAction = async (
  filters: EconomicActivityFilters,
): Promise<ApiResult<PagedResult<EconomicActivityCatalog>>> => {
  try {
    const activities = await clientesApi.listEconomicActivities(filters)
    return { success: true, data: activities }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible obtener las actividades económicas.',
    )
  }
}
