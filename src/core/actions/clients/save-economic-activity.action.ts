import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'

type EconomicActivityPayload = Omit<EconomicActivityCatalog, 'id' | 'sectorNombre'>

export const createEconomicActivityAction = async (
  payload: EconomicActivityPayload,
): Promise<ApiResult<EconomicActivityCatalog>> => {
  try {
    const activity = await clientesApi.createEconomicActivity(payload)
    return { success: true, data: activity }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible crear la actividad económica.',
    )
  }
}

export const updateEconomicActivityAction = async (
  activityId: string,
  payload: EconomicActivityPayload,
): Promise<ApiResult<EconomicActivityCatalog>> => {
  try {
    const activity = await clientesApi.updateEconomicActivity(
      activityId,
      payload,
    )
    return { success: true, data: activity }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la actividad económica.',
    )
  }
}
