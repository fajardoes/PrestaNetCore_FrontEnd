import { updateCollectionTransitAccountSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionTransitAccountSettingDto } from '@/infrastructure/interfaces/system/collection-transit-account-setting.dto'
import type { UpdateCollectionTransitAccountRequestDto } from '@/infrastructure/interfaces/system/update-collection-transit-account-request.dto'

export const updateCollectionTransitAccountSettingAction = async (
  payload: UpdateCollectionTransitAccountRequestDto,
): Promise<ApiResult<CollectionTransitAccountSettingDto>> => {
  try {
    const result = await updateCollectionTransitAccountSetting(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible actualizar la cuenta transitoria de recaudo.',
    )
  }
}
