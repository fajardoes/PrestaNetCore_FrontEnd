import { clientesApi, type CatalogFilters } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import type { PagedResult } from '@/types/pagination'

export const listClientCatalogsAction = async (
  filters: CatalogFilters,
): Promise<ApiResult<PagedResult<ClientCatalogItem>>> => {
  try {
    const catalogs = await clientesApi.listCatalogs(filters)
    return { success: true, data: catalogs }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible obtener los catálogos de clientes.',
    )
  }
}
