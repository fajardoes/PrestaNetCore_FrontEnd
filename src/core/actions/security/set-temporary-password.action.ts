import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export interface TemporaryPasswordParams {
  userId: string
  temporaryPassword: string
}

export type TemporaryPasswordResult = ApiResult<string>

export const setTemporaryPasswordAction = async ({
  userId,
  temporaryPassword,
}: TemporaryPasswordParams): Promise<TemporaryPasswordResult> => {
  try {
    const result = await securityApi.setTemporaryPassword(
      userId,
      temporaryPassword,
    )
    const generatedPassword =
      result.temporaryPassword || temporaryPassword || ''
    if (!generatedPassword) {
      return {
        success: false,
        error:
          'El servidor no entregó una contraseña temporal. Intenta nuevamente.',
      }
    }
    return { success: true, data: generatedPassword }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible generar la contraseña temporal.',
    )
  }
}
