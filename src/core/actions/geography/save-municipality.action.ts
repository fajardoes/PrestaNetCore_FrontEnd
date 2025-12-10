import {
  geographyApi,
  type MunicipalityPayload,
} from '@/core/api/geography-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'

export const saveMunicipalityAction = async (
  payload: MunicipalityPayload,
  municipalityId?: string,
): Promise<ApiResult<Municipality>> => {
  try {
    const result = municipalityId
      ? await geographyApi.updateMunicipality(municipalityId, payload)
      : await geographyApi.createMunicipality(payload)

    if (!result.succeeded || !result.municipality) {
      return {
        success: false,
        error:
          result.failureReason ??
          'No fue posible guardar el municipio. Verifica los datos.',
      }
    }

    return { success: true, data: result.municipality }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible guardar el municipio. Verifica los datos.',
    )
  }
}
