import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'

export const toggleEconomicActivityAction = async (
  activityId: string,
  activo: boolean,
): Promise<ApiResult<EconomicActivityCatalog>> => {
  try {
    const activity = await clientesApi.toggleEconomicActivity(activityId, activo)
    return { success: true, data: activity }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar el estado de la actividad.',
    )
  }
}
