import { updateAdminMenu } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  MenuItemAdminDto,
  MenuItemAdminPayload,
} from '@/infrastructure/interfaces/security/menu'

export class UpdateAdminMenuAction {
  async execute(
    menuId: string,
    payload: MenuItemAdminPayload,
  ): Promise<ApiResult<MenuItemAdminDto>> {
    try {
      const menu = await updateAdminMenu(menuId, payload)
      return { success: true, data: menu }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible actualizar el menu. Verifica los datos.',
      )
    }
  }
}
