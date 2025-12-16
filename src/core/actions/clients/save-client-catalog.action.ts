import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'

type CatalogPayload = Omit<ClientCatalogItem, 'id'> &
  Partial<Pick<ClientCatalogItem, 'id'>>

export const createClientCatalogAction = async (
  payload: CatalogPayload,
): Promise<ApiResult<ClientCatalogItem>> => {
  try {
    const catalog = await clientesApi.createCatalog(payload)
    return { success: true, data: catalog }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible crear el catálogo. Verifica los datos ingresados.',
    )
  }
}

export const updateClientCatalogAction = async (
  catalogId: string,
  payload: CatalogPayload,
): Promise<ApiResult<ClientCatalogItem>> => {
  try {
    const catalog = await clientesApi.updateCatalog(catalogId, payload)
    return { success: true, data: catalog }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar el catálogo seleccionado.',
    )
  }
}
