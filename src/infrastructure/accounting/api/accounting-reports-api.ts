import { httpClient } from '@/infrastructure/api/httpClient'
import type { TrialBalanceRequestDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-request.dto'
import type { TrialBalanceResultDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-result.dto'
import type { FinancialStatementsRequestDto } from '@/infrastructure/accounting/dtos/reports/financial-statements-request.dto'
import type { BalanceSheetResultDto } from '@/infrastructure/accounting/dtos/reports/balance-sheet-result.dto'
import type { IncomeStatementResultDto } from '@/infrastructure/accounting/dtos/reports/income-statement-result.dto'

export const accountingReportsApi = {
  async getTrialBalance(
    params: TrialBalanceRequestDto,
  ): Promise<TrialBalanceResultDto> {
    const { data } = await httpClient.get<TrialBalanceResultDto>(
      '/accounting/reports/trial-balance',
      { params },
    )
    return data
  },

  async getBalanceSheet(
    params: FinancialStatementsRequestDto,
  ): Promise<BalanceSheetResultDto> {
    const { data } = await httpClient.get<BalanceSheetResultDto>(
      '/accounting/reports/balance-sheet',
      { params },
    )
    return data
  },

  async getIncomeStatement(
    params: FinancialStatementsRequestDto,
  ): Promise<IncomeStatementResultDto> {
    const { data } = await httpClient.get<IncomeStatementResultDto>(
      '/accounting/reports/income-statement',
      { params },
    )
    return data
  },
}
