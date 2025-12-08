import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export const deleteEconomicActivityAction = async (
  activityId: string,
): Promise<ApiResult<undefined>> => {
  try {
    await clientesApi.deleteEconomicActivity(activityId)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible eliminar la actividad.')
  }
}
