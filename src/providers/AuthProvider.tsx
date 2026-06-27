import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApiEvents } from '@/infrastructure/api/httpClient'
import { tokenStorage } from '@/infrastructure/api/tokenStorage'
import { authService } from '@/infrastructure/services/AuthService'
import { loginAction } from '@/core/actions/auth/login.action'
import type { AuthUser, LoginCredentials } from '@/types/auth'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from 'jwt-decode'

interface AccessTokenPayload extends JwtPayload {
  sub?: string
  email?: string
  name?: string
  roles?: string[] | string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  isProcessing: boolean
  login(credentials: LoginCredentials): Promise<void>
  logout(): Promise<void>
  refreshSession(): Promise<void>
  setUserFromSession(user: AuthUser | null): void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const deriveUserFromToken = (token: string): AuthUser | null => {
  try {
    const payload = jwtDecode<AccessTokenPayload>(token)
    if (!payload.sub) {
      return null
    }
    const rolesArray: string[] =
      payload.roles && Array.isArray(payload.roles)
        ? payload.roles
        : typeof payload.roles === 'string'
          ? payload.roles.split(',').map((role: string) => role.trim())
          : []

    return {
      id: payload.sub,
      email: payload.email ?? '',
      fullName: payload.name ?? payload.email ?? 'Usuario',
      roles: rolesArray.filter(
        (role): role is string => typeof role === 'string' && role.length > 0,
      ),
    }
  } catch {
    return null
  }
}

const extractErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const axiosResponse = (error as {
      response?: { data?: unknown; statusText?: string }
    }).response
    if (axiosResponse?.data && typeof axiosResponse.data === 'string') {
      return axiosResponse.data
    }
    if (
      axiosResponse?.data &&
      typeof axiosResponse.data === 'object' &&
      'message' in axiosResponse.data
    ) {
      return String(
        (axiosResponse.data as { message?: string }).message ?? 'Error desconocido',
      )
    }
    if (axiosResponse?.statusText) {
      return axiosResponse.statusText
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado.'
}

export class ForcedPasswordChangeError extends Error {
  readonly email: string
  readonly currentPassword: string
  readonly rememberMe: boolean

  constructor(
    email: string,
    currentPassword: string,
    rememberMe: boolean,
    message?: string,
  ) {
    super(
      message ?? 'Debes actualizar tu contraseña antes de continuar en el prestanet.',
    )
    this.name = 'ForcedPasswordChangeError'
    this.email = email
    this.currentPassword = currentPassword
    this.rememberMe = rememberMe
    Object.setPrototypeOf(this, ForcedPasswordChangeError.prototype)
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const unsubscribe = authApiEvents.onUnauthorized(() => {
      tokenStorage.clearTokens()
      setUser(null)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const init = async () => {
      const tokens = tokenStorage.getTokens()
      if (!tokens?.accessToken) {
        setIsInitializing(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        const derivedUser = deriveUserFromToken(tokens.accessToken)
        setUser(derivedUser)
        if (!derivedUser) {
          tokenStorage.clearTokens()
        }
      } finally {
        setIsInitializing(false)
      }
    }
    void init()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsProcessing(true)
    try {
      const result = await loginAction(credentials)
      if (!result.success) {
        tokenStorage.clearTokens()
        if (result.data?.mustChangePassword) {
          throw new ForcedPasswordChangeError(
            credentials.email,
            credentials.password,
            Boolean(credentials.rememberMe),
            result.error,
          )
        }
        throw new Error(
          result.error ??
            result.data?.failureReason ??
            'No fue posible autenticar tus credenciales en el prestanet.',
        )
      }
      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        setUser(result.data.user)
      }
    } catch (error) {
      tokenStorage.clearTokens()
      if (error instanceof ForcedPasswordChangeError) {
        throw error
      }
      throw new Error(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsProcessing(true)
    try {
      if (tokenStorage.getAccessToken()) {
        await authService.logout()
      }
    } catch {
      // ignore logout errors, we want to force the local session to close anyway
    } finally {
      tokenStorage.clearTokens()
      setUser(null)
      setIsProcessing(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    const tokens = tokenStorage.getTokens()
    if (!tokens?.accessToken) {
      setUser(null)
      return
    }

    try {
      const profile = await authService.getProfile()
      setUser(profile)
    } catch (error) {
      tokenStorage.clearTokens()
      setUser(null)
      throw error
    }
  }, [])

  const setUserFromSession = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isProcessing,
      login,
      logout,
      refreshSession,
      setUserFromSession,
    }),
    [
      user,
      isInitializing,
      isProcessing,
      login,
      logout,
      refreshSession,
      setUserFromSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider')
  }
  return context
}
