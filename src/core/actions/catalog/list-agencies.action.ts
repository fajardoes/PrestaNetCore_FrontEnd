import { catalogApi } from '@/core/api/catalog-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

export const listAgenciesAction = async (
  onlyLoanApplicationEnabled = false,
): Promise<ApiResult<Agency[]>> => {
  try {
    const agencies = await catalogApi.listAgencies(onlyLoanApplicationEnabled)
    return { success: true, data: agencies }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible obtener el catálogo de agencias.',
    )
  }
}
