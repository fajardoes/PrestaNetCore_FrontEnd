import { runDailyClosing } from '@/core/api/loans/daily-loan-closing-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DailyLoanClosingRunRequest } from '@/infrastructure/loans/requests/daily-loan-closing-run-request'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

export const runDailyClosingAction = async (
  payload: DailyLoanClosingRunRequest,
): Promise<ApiResult<DailyLoanClosingRunResponse>> => {
  try {
    const data = await runDailyClosing(payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible ejecutar el cierre diario.')
  }
}
