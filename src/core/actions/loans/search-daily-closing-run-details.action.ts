import { searchDailyClosingRunDetails } from '@/core/api/loans/daily-loan-closing-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DailyClosingRunDetailFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-detail-filters-request'
import type { DailyClosingPagedResult } from '@/infrastructure/loans/responses/daily-closing-paged-result'
import type { DailyLoanClosingRunDetailResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'

export const searchDailyClosingRunDetailsAction = async (
  runId: string,
  params: DailyClosingRunDetailFiltersRequest,
): Promise<ApiResult<DailyClosingPagedResult<DailyLoanClosingRunDetailResponse>>> => {
  try {
    const data = await searchDailyClosingRunDetails(runId, params)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar los detalles del cierre.')
  }
}
