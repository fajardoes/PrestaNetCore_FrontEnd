import type { AuthTokens } from '@/types/auth'

let accessToken: string | null = null

export const tokenStorage = {
  getAccessToken(): string | null {
    return accessToken
  },
  setTokens(tokens: AuthTokens, _rememberMe = true) {
    accessToken = tokens.accessToken
  },
  clearTokens() {
    accessToken = null
  },
}
