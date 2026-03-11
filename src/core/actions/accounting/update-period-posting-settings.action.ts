import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

export type PeriodPostingOperation =
  | 'enable-adjustments'
  | 'disable-adjustments'
  | 'lock'
  | 'enable-automatic-posting'
  | 'disable-automatic-posting'

export const updatePeriodPostingSettingsAction = async (
  periodId: string,
  operation: PeriodPostingOperation,
): Promise<ApiResult<AccountingPeriodDto>> => {
  try {
    const result = await runOperation(periodId, operation)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar la configuracion del periodo.')
  }
}

const runOperation = (periodId: string, operation: PeriodPostingOperation) => {
  switch (operation) {
    case 'enable-adjustments':
      return accountingApi.enableAdjustments(periodId)
    case 'disable-adjustments':
      return accountingApi.disableAdjustments(periodId)
    case 'lock':
      return accountingApi.lockPeriod(periodId)
    case 'enable-automatic-posting':
      return accountingApi.enableAutomaticPosting(periodId)
    case 'disable-automatic-posting':
      return accountingApi.disableAutomaticPosting(periodId)
  }
}
