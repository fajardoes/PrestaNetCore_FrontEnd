import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

export const listUsersAction = async (): Promise<
  ApiResult<SecurityUser[]>
> => {
  try {
    const users = await securityApi.listUsers()
    return { success: true, data: users }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible obtener los usuarios.',
    )
  }
}
