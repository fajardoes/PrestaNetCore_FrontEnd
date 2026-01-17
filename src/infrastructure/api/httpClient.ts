import axios, { AxiosError, type AxiosInstance } from 'axios'
import { httpActivityTracker } from '@/infrastructure/api/httpActivityTracker'
import { tokenStorage } from './tokenStorage'
import type { RefreshResponse } from '@/types/auth'

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean
  }
}

const baseURL =
  typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL)
    : 'http://localhost:5009/api'

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export const authApiEvents = {
  onUnauthorized(listener: UnauthorizedListener) {
    unauthorizedListeners.add(listener)
    return () => {
      unauthorizedListeners.delete(listener)
    }
  },
  emitUnauthorized() {
    unauthorizedListeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // ignore listener errors to avoid breaking request chain
      }
    })
  },
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    tokenStorage.clearTokens()
    return null
  }

  refreshPromise = axios
    .post<RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
      {
        baseURL,
        withCredentials: true,
      },
    )
    .then((response) => {
      const { accessToken, refreshToken: nextRefresh } = response.data
      tokenStorage.setTokens({
        accessToken,
        refreshToken: nextRefresh ?? refreshToken,
      }, tokenStorage.shouldPersist())
      return accessToken
    })
    .catch(() => {
      tokenStorage.clearTokens()
      authApiEvents.emitUnauthorized()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

httpClient.interceptors.request.use((config) => {
  httpActivityTracker.increment()
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => {
    httpActivityTracker.decrement()
    return response
  },
  async (error: AxiosError) => {
    httpActivityTracker.decrement()
    const { response, config } = error
    if (!response || !config) {
      return Promise.reject(error)
    }

    if (response.status === 401 && !config._retry) {
      config._retry = true
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${newAccessToken}`
        return httpClient<unknown, unknown, unknown>(config)
      }
      authApiEvents.emitUnauthorized()
    }

    return Promise.reject(error)
  },
)
