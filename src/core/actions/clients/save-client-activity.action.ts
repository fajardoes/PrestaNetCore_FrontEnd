import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientActivity } from '@/infrastructure/interfaces/clients/client'

type ActivityPayload = Omit<ClientActivity, 'id' | 'actividadNombre' | 'sectorNombre'>

export const saveClientActivityAction = async (
  clientId: string,
  payload: ActivityPayload,
  activityId?: string,
): Promise<ApiResult<ClientActivity>> => {
  try {
    const activity = activityId
      ? await clientesApi.updateClientActivity(clientId, activityId, payload)
      : await clientesApi.createClientActivity(clientId, payload)
    return { success: true, data: activity }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible guardar la actividad del cliente.',
    )
  }
}
