import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientDetail } from '@/infrastructure/interfaces/clients/client'

export const getClientDetailAction = async (
  clientId: string,
): Promise<ApiResult<ClientDetail>> => {
  try {
    const client = await clientesApi.getClient(clientId)
    return { success: true, data: client }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el detalle del cliente.')
  }
}
