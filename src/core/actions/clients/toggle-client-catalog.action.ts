import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'

export const toggleClientCatalogAction = async (
  catalogId: string,
  activo: boolean,
): Promise<ApiResult<ClientCatalogItem>> => {
  try {
    const catalog = await clientesApi.toggleCatalog(catalogId, activo)
    return { success: true, data: catalog }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar el estado del catálogo.',
    )
  }
}
