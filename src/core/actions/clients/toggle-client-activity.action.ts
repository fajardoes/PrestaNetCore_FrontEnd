import { clientesApi } from '@/core/api/clientes-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ClientActivity } from '@/infrastructure/interfaces/clients/client'

export const toggleClientActivityAction = async (
  clientId: string,
  activityId: string,
  activo: boolean,
): Promise<ApiResult<ClientActivity>> => {
  try {
    const activity = await clientesApi.toggleClientActivity(
      clientId,
      activityId,
      activo,
    )
    return { success: true, data: activity }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la actividad seleccionada.',
    )
  }
}
