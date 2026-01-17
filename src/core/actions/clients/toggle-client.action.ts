import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const toggleClientAction = async (
  clientId: string,
  activo: boolean,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.toggleClient(clientId, activo)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el estado del cliente.')
  }
}
