import { getDailyClosingStatus } from '@/core/api/loans/daily-loan-closing-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

export const getDailyClosingStatusAction =
  async (): Promise<ApiResult<DailyLoanClosingStatusResponse>> => {
    try {
      const data = await getDailyClosingStatus()
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar el estado del cierre diario.')
    }
  }
