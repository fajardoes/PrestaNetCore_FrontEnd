import { getLoanInterestAccrualSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanInterestAccrualSettingDto } from '@/infrastructure/interfaces/system/loan-interest-accrual-setting.dto'

export const getLoanInterestAccrualSettingAction = async (): Promise<
  ApiResult<LoanInterestAccrualSettingDto>
> => {
  try {
    const result = await getLoanInterestAccrualSetting()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener la configuración del devengo de intereses.')
  }
}
