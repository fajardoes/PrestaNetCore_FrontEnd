import { clientesApi, type ListClientsFilters } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { PagedResult } from '@/types/pagination'

export const listClientsAction = async (
  filters: ListClientsFilters,
): Promise<ApiResult<PagedResult<ClientListItem>>> => {
  try {
    const clients = await clientesApi.listClients(filters)
    return { success: true, data: clients }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener la lista de clientes.')
  }
}
