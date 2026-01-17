import {
  clientesApi,
  type ChildListFilters,
} from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientActivity } from '@/infrastructure/interfaces/clients/client'
import type { PagedResult } from '@/types/pagination'

export const listClientActivitiesAction = async (
  clientId: string,
  filters: ChildListFilters,
): Promise<ApiResult<PagedResult<ClientActivity>>> => {
  try {
    const activities = await clientesApi.listClientActivities(clientId, filters)
    return { success: true, data: activities }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener las actividades.')
  }
}
