import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deleteClientReferenceAction = async (
  clientId: string,
  referenceId: string,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.deleteClientReference(clientId, referenceId)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible eliminar la referencia.')
  }
}
