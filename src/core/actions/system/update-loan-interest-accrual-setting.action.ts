import { updateLoanInterestAccrualSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanInterestAccrualSettingDto } from '@/infrastructure/interfaces/system/loan-interest-accrual-setting.dto'
import type { UpdateLoanInterestAccrualSettingRequest } from '@/infrastructure/interfaces/system/update-loan-interest-accrual-setting.request'

export const updateLoanInterestAccrualSettingAction = async (
  payload: UpdateLoanInterestAccrualSettingRequest,
): Promise<ApiResult<LoanInterestAccrualSettingDto>> => {
  try {
    const result = await updateLoanInterestAccrualSetting(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar la configuración del devengo de intereses.')
  }
}
