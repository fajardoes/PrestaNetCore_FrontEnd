import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientReference } from '@/infrastructure/interfaces/clients/client'

type ReferencePayload = Omit<ClientReference, 'id'>

export const saveClientReferenceAction = async (
  clientId: string,
  payload: ReferencePayload,
  referenceId?: string,
): Promise<ApiResult<ClientReference>> => {
  try {
    const reference = referenceId
      ? await clientesApi.updateClientReference(clientId, referenceId, payload)
      : await clientesApi.createClientReference(clientId, payload)
    return { success: true, data: reference }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible guardar la referencia personal.',
    )
  }
}
