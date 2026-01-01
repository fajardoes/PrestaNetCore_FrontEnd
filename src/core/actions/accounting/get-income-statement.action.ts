import { accountingReportsApi } from '@/infrastructure/accounting/api/accounting-reports-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { FinancialStatementsRequestDto } from '@/infrastructure/accounting/dtos/reports/financial-statements-request.dto'
import type { IncomeStatementResultDto } from '@/infrastructure/accounting/dtos/reports/income-statement-result.dto'

export const getIncomeStatementAction = async (
  params: FinancialStatementsRequestDto,
): Promise<ApiResult<IncomeStatementResultDto>> => {
  try {
    const result = await accountingReportsApi.getIncomeStatement(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el estado de resultados.')
  }
}
