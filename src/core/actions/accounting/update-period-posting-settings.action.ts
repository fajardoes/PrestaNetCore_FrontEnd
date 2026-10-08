import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

export type PeriodPostingOperation =
  | 'enable-adjustments'
  | 'disable-adjustments'
  | 'lock'
  | 'unlock'
  | 'enable-automatic-posting'
  | 'disable-automatic-posting'

export const updatePeriodPostingSettingsAction = async (
  periodId: string,
  operation: PeriodPostingOperation,
  reason?: string,
): Promise<ApiResult<AccountingPeriodDto>> => {
  try {
    const result = await runOperation(periodId, operation, reason)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar la configuracion del periodo.')
  }
}

const runOperation = (periodId: string, operation: PeriodPostingOperation, reason?: string) => {
  switch (operation) {
    case 'enable-adjustments':
      return accountingApi.enableAdjustments(periodId)
    case 'disable-adjustments':
      return accountingApi.disableAdjustments(periodId)
    case 'lock':
      return accountingApi.lockPeriod(periodId)
    case 'unlock':
      if (!reason?.trim()) {
        throw new Error('Indica el motivo para desbloquear el período.')
      }
      return accountingApi.unlockPeriod(periodId, reason.trim())
    case 'enable-automatic-posting':
      return accountingApi.enableAutomaticPosting(periodId)
    case 'disable-automatic-posting':
      return accountingApi.disableAutomaticPosting(periodId)
  }
}
