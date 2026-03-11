import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'
import type { UpdateLoanDisbursementAccountRequestDto } from '@/infrastructure/interfaces/system/update-loan-disbursement-account-request.dto'

const basePath = '/system/settings'

export const getLoanDisbursementAccountSetting =
  async (): Promise<LoanDisbursementAccountSettingDto> => {
    const { data } = await httpClient.get<LoanDisbursementAccountSettingDto>(
      `${basePath}/loan-disbursement-account`,
    )
    return data
  }

export const updateLoanDisbursementAccountSetting = async (
  payload: UpdateLoanDisbursementAccountRequestDto,
): Promise<LoanDisbursementAccountSettingDto> => {
  const { data } = await httpClient.put<LoanDisbursementAccountSettingDto>(
    `${basePath}/loan-disbursement-account`,
    payload,
  )
  return data
}
