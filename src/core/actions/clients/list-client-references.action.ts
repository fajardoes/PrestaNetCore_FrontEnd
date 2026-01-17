import {
  clientesApi,
  type ChildListFilters,
} from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientReference } from '@/infrastructure/interfaces/clients/client'
import type { PagedResult } from '@/types/pagination'

export const listClientReferencesAction = async (
  clientId: string,
  filters: ChildListFilters,
): Promise<ApiResult<PagedResult<ClientReference>>> => {
  try {
    const references = await clientesApi.listClientReferences(clientId, filters)
    return { success: true, data: references }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener las referencias.')
  }
}
