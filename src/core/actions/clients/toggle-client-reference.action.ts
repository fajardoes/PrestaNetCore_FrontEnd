import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientReference } from '@/infrastructure/interfaces/clients/client'

export const toggleClientReferenceAction = async (
  clientId: string,
  referenceId: string,
  activo: boolean,
): Promise<ApiResult<ClientReference>> => {
  try {
    const reference = await clientesApi.toggleClientReference(
      clientId,
      referenceId,
      activo,
    )
    return { success: true, data: reference }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la referencia seleccionada.',
    )
  }
}
