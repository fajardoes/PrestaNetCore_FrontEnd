import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deleteClientAction = async (
  clientId: string,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.deleteClient(clientId)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible eliminar el cliente.')
  }
}
