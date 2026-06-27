import { getDailyClosingRun } from '@/core/api/loans/daily-loan-closing-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

export const getDailyClosingRunAction = async (
  id: string,
): Promise<ApiResult<DailyLoanClosingRunResponse>> => {
  try {
    const data = await getDailyClosingRun(id)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar el run de cierre.')
  }
}
