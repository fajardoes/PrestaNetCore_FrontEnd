import { accountingApi, type PeriodFilters } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { PagedResponse } from '@/infrastructure/interfaces/accounting/paged-response'

export const listPeriodsAction = async (
  filters: PeriodFilters,
): Promise<ApiResult<PagedResponse<AccountingPeriodDto>>> => {
  try {
    const result = await accountingApi.getPeriods(filters)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los períodos contables.')
  }
}
