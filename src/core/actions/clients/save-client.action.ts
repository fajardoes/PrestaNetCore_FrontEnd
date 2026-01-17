import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  ClientCreatePayload,
  ClientDetail,
  ClientUpdatePayload,
} from '@/infrastructure/interfaces/clients/client'

interface SaveClientInput {
  clientId?: string
  payload: ClientCreatePayload | ClientUpdatePayload
}

export const saveClientAction = async ({
  clientId,
  payload,
}: SaveClientInput): Promise<ApiResult<ClientDetail>> => {
  try {
    const result = clientId
      ? await clientesApi.updateClient(clientId, payload)
      : await clientesApi.createClient(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible guardar el cliente. Verifica los datos.',
    )
  }
}
