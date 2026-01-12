import { getMyMenus } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'

export class GetMyMenusAction {
  async execute(): Promise<ApiResult<MenuItemTreeDto[]>> {
    try {
      const menus = await getMyMenus()
      return { success: true, data: menus }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible obtener los menus.',
      )
    }
  }
}
