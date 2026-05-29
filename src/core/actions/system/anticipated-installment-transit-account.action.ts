import {
  getAnticipatedInstallmentTransitAccountSetting,
  updateAnticipatedInstallmentTransitAccountSetting,
} from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AnticipatedInstallmentTransitAccountSettingDto } from '@/infrastructure/interfaces/system/anticipated-installment-transit-account-setting.dto'
import type { UpdateAnticipatedInstallmentTransitAccountRequestDto } from '@/infrastructure/interfaces/system/update-anticipated-installment-transit-account-request.dto'

export const getAnticipatedInstallmentTransitAccountSettingAction =
  async (): Promise<ApiResult<AnticipatedInstallmentTransitAccountSettingDto>> => {
    try {
      return { success: true, data: await getAnticipatedInstallmentTransitAccountSetting() }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar la cuenta transitoria.')
    }
  }

export const updateAnticipatedInstallmentTransitAccountSettingAction = async (
  payload: UpdateAnticipatedInstallmentTransitAccountRequestDto,
): Promise<ApiResult<AnticipatedInstallmentTransitAccountSettingDto>> => {
  try {
    return { success: true, data: await updateAnticipatedInstallmentTransitAccountSetting(payload) }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar la cuenta transitoria.')
  }
}
