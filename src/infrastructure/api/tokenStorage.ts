import type { AuthTokens } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'prestanet.accessToken'
const REFRESH_TOKEN_KEY = 'prestanet.refreshToken'
const PERSISTENCE_KEY = 'prestanet.tokenPersistence'

const safeWindow = typeof window !== 'undefined' ? window : undefined

const getItem = (key: string) => {
  if (!safeWindow) {
    return null
  }
  const storages = [safeWindow.localStorage, safeWindow.sessionStorage]
  for (const storage of storages) {
    try {
      const value = storage.getItem(key)
      if (value) {
        return value
      }
    } catch {
      // ignore read errors
    }
  }
  return null
}

const removeItem = (key: string) => {
  if (!safeWindow) {
    return
  }
  const storages = [safeWindow.localStorage, safeWindow.sessionStorage]
  for (const storage of storages) {
    try {
      storage.removeItem(key)
    } catch {
      // ignore remove errors
    }
  }
}

const setItem = (key: string, value: string | null, persistent: boolean) => {
  if (!safeWindow) {
    return
  }
  const target = persistent
    ? safeWindow.localStorage
    : safeWindow.sessionStorage
  const other = persistent
    ? safeWindow.sessionStorage
    : safeWindow.localStorage

  try {
    if (value === null || value === undefined) {
      target.removeItem(key)
    } else {
      target.setItem(key, value)
    }
  } catch {
    // ignore write errors silently
  }

  try {
    other.removeItem(key)
  } catch {
    // ignore remove errors silently
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return getItem(REFRESH_TOKEN_KEY)
  },
  getTokens(): AuthTokens | null {
    const accessToken = tokenStorage.getAccessToken()
    if (!accessToken) return null

    return {
      accessToken,
      refreshToken: tokenStorage.getRefreshToken(),
    }
  },
  setTokens(tokens: AuthTokens, rememberMe = true) {
    setItem(ACCESS_TOKEN_KEY, tokens.accessToken, rememberMe)
    setItem(REFRESH_TOKEN_KEY, tokens.refreshToken ?? null, rememberMe)
    setItem(PERSISTENCE_KEY, rememberMe ? 'persistent' : 'session', rememberMe)
  },
  clearTokens() {
    removeItem(ACCESS_TOKEN_KEY)
    removeItem(REFRESH_TOKEN_KEY)
    removeItem(PERSISTENCE_KEY)
  },
  shouldPersist(): boolean {
    return getItem(PERSISTENCE_KEY) !== 'session'
  },
}
