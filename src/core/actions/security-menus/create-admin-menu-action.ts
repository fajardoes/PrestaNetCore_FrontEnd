import { createAdminMenu } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  MenuItemAdminDto,
  MenuItemAdminPayload,
} from '@/infrastructure/interfaces/security/menu'

export class CreateAdminMenuAction {
  async execute(
    payload: MenuItemAdminPayload,
  ): Promise<ApiResult<MenuItemAdminDto>> {
    try {
      const menu = await createAdminMenu(payload)
      return { success: true, data: menu }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible crear el menu. Verifica los datos.',
      )
    }
  }
}
