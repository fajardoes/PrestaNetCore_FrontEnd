import { catalogApi, type AgencyPayload } from '@/core/api/catalog-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

export type UpdateAgencyResult = ApiResult<Agency>

export const updateAgencyAction = async (
  agencyId: string,
  payload: AgencyPayload,
): Promise<UpdateAgencyResult> => {
  try {
    const result = await catalogApi.updateAgency(agencyId, payload)
    if (!result.succeeded || !result.agency) {
      return {
        success: false,
        error: 'No fue posible actualizar la agencia.',
      }
    }
    return { success: true, data: result.agency }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible actualizar la agencia.',
    )
  }
}
