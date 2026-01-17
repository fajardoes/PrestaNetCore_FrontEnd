import { authApi } from '@/core/api/auth-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ChangePasswordWithCurrentPayload } from '@/types/auth'

export type ChangePasswordActionResult = ApiResult<true>

export const changePasswordWithCurrentAction = async (
  payload: ChangePasswordWithCurrentPayload,
): Promise<ChangePasswordActionResult> => {
  try {
    const result = await authApi.changePasswordWithCurrent(payload)
    if (!result.succeeded) {
      return {
        success: false,
        error:
          result.failureReason ??
          'No fue posible actualizar la contraseña. Intenta nuevamente.',
      }
    }

    return { success: true, data: true }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible actualizar la contraseña.',
    )
  }
}
