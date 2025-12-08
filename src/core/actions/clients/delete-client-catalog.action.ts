import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deleteClientCatalogAction = async (
  catalogId: string,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.deleteCatalog(catalogId)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible eliminar el catálogo.')
  }
}
