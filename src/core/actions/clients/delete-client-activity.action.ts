import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deleteClientActivityAction = async (
  clientId: string,
  activityId: string,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.deleteClientActivity(clientId, activityId)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible eliminar la actividad.')
  }
}
