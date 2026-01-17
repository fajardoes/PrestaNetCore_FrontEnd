import {
  authApi,
  type RequestPasswordResetPayload,
  type ResetPasswordPayload,
} from '@/core/api/auth-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export type RequestPasswordResetResult = ApiResult<true>
export type ResetPasswordResult = ApiResult<true>

export const requestPasswordResetAction = async (
  payload: RequestPasswordResetPayload,
): Promise<RequestPasswordResetResult> => {
  try {
    const result = await authApi.requestPasswordReset(payload)
    if (!result.succeeded) {
      return {
        success: false,
        error:
          result.failureReason ??
          'No fue posible enviar el enlace de restablecimiento.',
      }
    }
    return { success: true, data: true }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible solicitar el restablecimiento de contraseña.',
    )
  }
}

export const resetPasswordWithTokenAction = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResult> => {
  try {
    const result = await authApi.resetPassword(payload)
    if (!result.succeeded) {
      return {
        success: false,
        error:
          result.failureReason ??
          'No fue posible actualizar la contraseña. Verifica el token.',
      }
    }
    return { success: true, data: true }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible restablecer la contraseña.',
    )
  }
}
