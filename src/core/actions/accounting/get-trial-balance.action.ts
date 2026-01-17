import { accountingReportsApi } from '@/infrastructure/accounting/api/accounting-reports-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { TrialBalanceRequestDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-request.dto'
import type { TrialBalanceResultDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-result.dto'

export const getTrialBalanceAction = async (
  params: TrialBalanceRequestDto,
): Promise<ApiResult<TrialBalanceResultDto>> => {
  try {
    const result = await accountingReportsApi.getTrialBalance(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el balance de comprobacion.')
  }
}
