import axios, { AxiosError, type AxiosInstance } from 'axios'
import { httpActivityTracker } from '@/infrastructure/api/httpActivityTracker'
import { tokenStorage } from './tokenStorage'
import type { RefreshResponse } from '@/types/auth'

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean
    skipAuthRefresh?: boolean
    skipGlobalLoading?: boolean
    _countedInGlobalLoading?: boolean
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

let refreshPromise: Promise<RefreshResponse | null> | null = null

export const requestRefreshSession = async (): Promise<RefreshResponse | null> => {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = axios
    .post<RefreshResponse>('/auth/refresh', undefined, {
      baseURL,
      withCredentials: true,
    })
    .then((response) => {
      tokenStorage.setTokens({ accessToken: response.data.accessToken })
      return response.data
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

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshed = await requestRefreshSession()
  return refreshed?.accessToken ?? null
}

httpClient.interceptors.request.use((config) => {
  if (!config.skipGlobalLoading) {
    httpActivityTracker.increment()
    config._countedInGlobalLoading = true
  } else {
    config._countedInGlobalLoading = false
  }
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => {
    if (response.config?._countedInGlobalLoading) {
      httpActivityTracker.decrement()
    }
    return response
  },
  async (error: AxiosError) => {
    if (error.config?._countedInGlobalLoading) {
      httpActivityTracker.decrement()
    }
    const { response, config } = error
    if (!response || !config) {
      return Promise.reject(error)
    }

    if (response.status === 401 && !config._retry && !config.skipAuthRefresh) {
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
