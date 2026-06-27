import { getLoanDisbursementAccountSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'

export const getLoanDisbursementAccountSettingAction = async (): Promise<
  ApiResult<LoanDisbursementAccountSettingDto>
> => {
  try {
    const result = await getLoanDisbursementAccountSetting()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible obtener la cuenta contable de desembolso.',
    )
  }
}
