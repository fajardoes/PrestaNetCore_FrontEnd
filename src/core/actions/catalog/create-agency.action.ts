import { catalogApi, type AgencyPayload } from '@/core/api/catalog-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

export type CreateAgencyResult = ApiResult<Agency>

export const createAgencyAction = async (
  payload: AgencyPayload,
): Promise<CreateAgencyResult> => {
  try {
    const result = await catalogApi.createAgency(payload)
    if (!result.succeeded || !result.agency) {
      return {
        success: false,
        error: 'No fue posible crear la agencia.',
      }
    }
    return { success: true, data: result.agency }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible crear la agencia. Verifica los datos.',
    )
  }
}
