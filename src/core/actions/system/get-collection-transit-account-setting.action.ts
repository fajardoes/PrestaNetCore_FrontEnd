import { getCollectionTransitAccountSetting } from '@/core/api/system/system-settings-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionTransitAccountSettingDto } from '@/infrastructure/interfaces/system/collection-transit-account-setting.dto'

export const getCollectionTransitAccountSettingAction = async (): Promise<
  ApiResult<CollectionTransitAccountSettingDto>
> => {
  try {
    const result = await getCollectionTransitAccountSetting()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible obtener la cuenta transitoria de recaudo.',
    )
  }
}
