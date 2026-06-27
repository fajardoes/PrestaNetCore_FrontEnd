import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  AuthUser,
  ChangePasswordWithCurrentPayload,
  IdentityOperationResult,
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
} from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const payload = {
      email: credentials.email,
      password: credentials.password,
      rememberMe: Boolean(credentials.rememberMe),
    }
    const { data } = await httpClient.post<LoginResponse>(
      '/auth/login',
      payload,
    )
    const raw = data as LoginResponse & { MustChangePassword?: boolean }
    const normalizedMustChange =
      typeof raw.mustChangePassword === 'boolean'
        ? raw.mustChangePassword
        : typeof raw.MustChangePassword === 'boolean'
          ? raw.MustChangePassword
          : false
    return {
      ...raw,
      mustChangePassword: normalizedMustChange,
    }
  }

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  }

  async getProfile(): Promise<AuthUser> {
    const { data } = await httpClient.get<AuthUser>('/auth/me')
    const baseProfile = data

    const normalizeQueryOfficeIds = (
      raw: unknown,
      fallbackAgencyId?: string | null,
    ): string[] => {
      const payload =
        raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null

      const queryOfficeIds = payload?.queryOfficeIds
      const queryOfficeIdsPascal = payload?.QueryOfficeIds

      const values: unknown[] = Array.isArray(raw)
        ? raw
        : Array.isArray(queryOfficeIds)
          ? queryOfficeIds
          : Array.isArray(queryOfficeIdsPascal)
            ? queryOfficeIdsPascal
            : []

      const normalized = values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0)

      if (normalized.length > 0) {
        return Array.from(new Set(normalized))
      }

      const agencyId = fallbackAgencyId?.trim()
      return agencyId ? [agencyId] : []
    }

    try {
      const { data: scope } = await httpClient.get('/auth/users/' + baseProfile.id + '/offices')
      return {
        ...baseProfile,
        queryOfficeIds: normalizeQueryOfficeIds(scope, baseProfile.agencyId),
      }
    } catch {
      return {
        ...baseProfile,
        queryOfficeIds: normalizeQueryOfficeIds(null, baseProfile.agencyId),
      }
    }
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await httpClient.post<RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
    )
    return data
  }

  async changePasswordWithCurrent(
    payload: ChangePasswordWithCurrentPayload,
  ): Promise<IdentityOperationResult> {
    const { data } = await httpClient.post<IdentityOperationResult>(
      '/auth/change_password_with_current',
      payload,
    )
    return data
  }
}

export const authService = new AuthService()
