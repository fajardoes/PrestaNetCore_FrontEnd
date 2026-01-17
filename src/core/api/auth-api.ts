import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  AuthUser,
  ChangePasswordWithCurrentPayload,
} from '@/types/auth'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface NormalizedLoginResponse {
  succeeded: boolean
  requiresTwoFactor: boolean
  isLockedOut: boolean
  mustChangePassword: boolean
  failureReason: string | null
  accessToken: string | null
}

interface RawLoginResponse {
  succeeded?: boolean
  requiresTwoFactor?: boolean
  isLockedOut?: boolean
  mustChangePassword?: boolean
  MustChangePassword?: boolean
  failureReason?: string | null
  accessToken?: string | { token?: string | null } | null
}

export interface IdentityOperationResponse {
  succeeded: boolean
  failureReason: string | null
}

export interface ResetPasswordPayload {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export interface RequestPasswordResetPayload {
  email: string
}

const normalizeLoginResponse = (
  raw: RawLoginResponse,
): NormalizedLoginResponse => {
  const accessToken =
    typeof raw.accessToken === 'string'
      ? raw.accessToken
      : typeof raw.accessToken === 'object' && raw.accessToken !== null
        ? raw.accessToken.token ?? null
        : null

  const mustChangePassword =
    typeof raw.mustChangePassword === 'boolean'
      ? raw.mustChangePassword
      : typeof raw.MustChangePassword === 'boolean'
        ? raw.MustChangePassword
        : false

  return {
    succeeded: Boolean(raw.succeeded),
    requiresTwoFactor: Boolean(raw.requiresTwoFactor),
    isLockedOut: Boolean(raw.isLockedOut),
    mustChangePassword,
    failureReason:
      typeof raw.failureReason === 'string' ? raw.failureReason : null,
    accessToken,
  }
}

export const authApi = {
  async login(request: LoginRequest): Promise<NormalizedLoginResponse> {
    const { data } = await httpClient.post<RawLoginResponse>(
      '/auth/login',
      request,
    )
    return normalizeLoginResponse(data ?? {})
  },

  async changePasswordWithCurrent(
    payload: ChangePasswordWithCurrentPayload,
  ): Promise<IdentityOperationResponse> {
    const { data } = await httpClient.post<IdentityOperationResponse>(
      '/auth/change_password_with_current',
      payload,
    )
    return data
  },

  async requestPasswordReset(
    payload: RequestPasswordResetPayload,
  ): Promise<IdentityOperationResponse> {
    const { data } = await httpClient.post<IdentityOperationResponse>(
      '/auth/request_password_reset',
      payload,
    )
    return data
  },

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<IdentityOperationResponse> {
    const { data } = await httpClient.post<IdentityOperationResponse>(
      '/auth/reset_password',
      payload,
    )
    return data
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await httpClient.get<AuthUser>('/auth/me')
    return data
  },
}
