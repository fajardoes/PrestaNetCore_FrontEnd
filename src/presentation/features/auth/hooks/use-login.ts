import { useCallback, useState } from 'react'
import { loginAction } from '@/core/actions/auth/login.action'
import type { LoginRequest } from '@/core/api/auth-api'
import { useAuth } from '@/hooks/useAuth'

interface UseLoginState {
  isLoading: boolean
  error: string | null
  mustChangePassword: boolean
  requiresTwoFactor: boolean
  isLockedOut: boolean
  failureReason: string | null
}

export const useLogin = () => {
  const { setUserFromSession } = useAuth()
  const [state, setState] = useState<UseLoginState>({
    isLoading: false,
    error: null,
    mustChangePassword: false,
    requiresTwoFactor: false,
    isLockedOut: false,
    failureReason: null,
  })

  const login = useCallback(
    async (payload: LoginRequest) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        mustChangePassword: false,
        requiresTwoFactor: false,
        isLockedOut: false,
        failureReason: null,
      }))

      const result = await loginAction(payload)
      if (result.success) {
        setUserFromSession(result.data.user)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          mustChangePassword: false,
          requiresTwoFactor: result.data.requiresTwoFactor,
          isLockedOut: result.data.isLockedOut,
          failureReason: null,
        }))
        return { success: true }
      }

      const meta = result.data
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error,
        mustChangePassword: Boolean(meta?.mustChangePassword),
        requiresTwoFactor: Boolean(meta?.requiresTwoFactor),
        isLockedOut: Boolean(meta?.isLockedOut),
        failureReason: meta?.failureReason ?? null,
      }))

      return {
        success: false,
        mustChangePassword: Boolean(meta?.mustChangePassword),
      }
    },
    [setUserFromSession],
  )

  return {
    ...state,
    login,
  }
}
