import { geographyApi } from '@/core/api/geography-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'

export const listMunicipalitiesAction = async (
  departmentId?: string,
): Promise<ApiResult<Municipality[]>> => {
  try {
    const municipalities = await geographyApi.listMunicipalities(departmentId)
    return { success: true, data: municipalities }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible obtener los municipios. Intenta nuevamente.',
    )
  }
}
