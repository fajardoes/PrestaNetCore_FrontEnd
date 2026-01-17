import { authApi, type LoginRequest } from '@/core/api/auth-api'
import {
  toApiError,
  type ApiResult,
  type ApiFailure,
} from '@/core/helpers/api-result'
import { tokenStorage } from '@/infrastructure/api/tokenStorage'
import type { AuthUser } from '@/types/auth'

export interface LoginActionMetadata {
  mustChangePassword: boolean
  isLockedOut: boolean
  requiresTwoFactor: boolean
  failureReason: string | null
}

export interface LoginActionSuccess extends LoginActionMetadata {
  user: AuthUser
  accessToken: string
}

export type LoginActionResult = ApiResult<
  LoginActionSuccess,
  LoginActionMetadata
>

const buildMeta = (response: {
  mustChangePassword: boolean
  isLockedOut: boolean
  requiresTwoFactor: boolean
  failureReason: string | null
}): LoginActionMetadata => ({
  mustChangePassword: response.mustChangePassword,
  isLockedOut: response.isLockedOut,
  requiresTwoFactor: response.requiresTwoFactor,
  failureReason: response.failureReason,
})

export const loginAction = async (
  payload: LoginRequest,
): Promise<LoginActionResult> => {
  try {
    const response = await authApi.login(payload)
    const meta = buildMeta(response)

    if (response.mustChangePassword) {
      tokenStorage.clearTokens()
      const failure: ApiFailure<LoginActionMetadata> = {
        success: false,
        error:
          response.failureReason ??
          'Debes actualizar tu contraseña antes de continuar.',
        data: meta,
      }
      return failure
    }

    if (!response.succeeded || !response.accessToken) {
      tokenStorage.clearTokens()
      const failure: ApiFailure<LoginActionMetadata> = {
        success: false,
        error:
          response.failureReason ??
          (response.isLockedOut
            ? 'Tu cuenta está bloqueada temporalmente.'
            : 'No fue posible iniciar sesión.'),
        data: meta,
      }
      return failure
    }

    tokenStorage.setTokens(
      { accessToken: response.accessToken },
      Boolean(payload.rememberMe),
    )
    const user = await authApi.getCurrentUser()

    return {
      success: true,
      data: {
        ...meta,
        user,
        accessToken: response.accessToken,
      },
    }
  } catch (error) {
    tokenStorage.clearTokens()
    return toApiError<LoginActionMetadata | undefined>(
      error,
      'No fue posible iniciar sesión.',
    )
  }
}
