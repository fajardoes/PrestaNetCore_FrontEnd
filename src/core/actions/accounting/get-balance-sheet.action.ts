import { accountingReportsApi } from '@/infrastructure/accounting/api/accounting-reports-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { FinancialStatementsRequestDto } from '@/infrastructure/accounting/dtos/reports/financial-statements-request.dto'
import type { BalanceSheetResultDto } from '@/infrastructure/accounting/dtos/reports/balance-sheet-result.dto'

export const getBalanceSheetAction = async (
  params: FinancialStatementsRequestDto,
): Promise<ApiResult<BalanceSheetResultDto>> => {
  try {
    const result = await accountingReportsApi.getBalanceSheet(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el balance general.')
  }
}
