import { updateLoanDisbursementAccountSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'
import type { UpdateLoanDisbursementAccountRequestDto } from '@/infrastructure/interfaces/system/update-loan-disbursement-account-request.dto'

export const updateLoanDisbursementAccountSettingAction = async (
  payload: UpdateLoanDisbursementAccountRequestDto,
): Promise<ApiResult<LoanDisbursementAccountSettingDto>> => {
  try {
    const result = await updateLoanDisbursementAccountSetting(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la cuenta contable de desembolso.',
    )
  }
}
