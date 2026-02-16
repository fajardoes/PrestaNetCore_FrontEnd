export type Role = string

export interface AuthUser {
  id: string
  email: string
  fullName: string
  roles: Role[]
  agencyId?: string | null
  agencyName?: string | null
  agencyCode?: string | null
  queryOfficeIds?: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  succeeded: boolean
  requiresTwoFactor: boolean
  isLockedOut: boolean
  mustChangePassword: boolean
  failureReason: string | null
  accessToken: {
    token: string
    expiresAt: string
  } | null
}

export interface IdentityOperationResult {
  succeeded: boolean
  failureReason: string | null
}

export interface ChangePasswordWithCurrentPayload {
  email: string
  currentPassword: string
  newPassword: string
}

export type RefreshResponse = AuthTokens
