import { searchDailyClosingRuns } from '@/core/api/loans/daily-loan-closing-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DailyClosingRunFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-filters-request'
import type { DailyClosingPagedResult } from '@/infrastructure/loans/responses/daily-closing-paged-result'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

export const searchDailyClosingRunsAction = async (
  params: DailyClosingRunFiltersRequest,
): Promise<ApiResult<DailyClosingPagedResult<DailyLoanClosingRunResponse>>> => {
  try {
    const data = await searchDailyClosingRuns(params)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar el histórico de cierres.')
  }
}
