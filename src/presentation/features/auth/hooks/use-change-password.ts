import { useCallback, useState } from 'react'
import { changePasswordWithCurrentAction } from '@/core/actions/auth/change-password.action'
import { loginAction } from '@/core/actions/auth/login.action'
import { useAuth } from '@/hooks/useAuth'

interface ChangePasswordParams {
  email: string
  currentPassword: string
  newPassword: string
  rememberMe?: boolean
}

interface ChangePasswordState {
  isLoading: boolean
  error: string | null
}

export const useChangePassword = () => {
  const { setUserFromSession } = useAuth()
  const [state, setState] = useState<ChangePasswordState>({
    isLoading: false,
    error: null,
  })

  const changePassword = useCallback(
    async (params: ChangePasswordParams) => {
      if (params.currentPassword === params.newPassword) {
        const message =
          'La nueva contraseña debe ser diferente a la contraseña actual.'
        setState({ isLoading: false, error: message })
        return { success: false, error: message }
      }

      setState({ isLoading: true, error: null })

      const result = await changePasswordWithCurrentAction({
        email: params.email,
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
      })

      if (!result.success) {
        setState({ isLoading: false, error: result.error })
        return { success: false, error: result.error }
      }

      const loginResult = await loginAction({
        email: params.email,
        password: params.newPassword,
        rememberMe: params.rememberMe,
      })

      if (loginResult.success) {
        setUserFromSession(loginResult.data.user)
        setState({ isLoading: false, error: null })
        return { success: true }
      }

      const loginError =
        loginResult.error ??
        'La contraseña se actualizó pero no fue posible iniciar sesión.'

      setState({ isLoading: false, error: loginError })
      return { success: false, error: loginError }
    },
    [setUserFromSession],
  )

  return {
    ...state,
    changePassword,
  }
}
