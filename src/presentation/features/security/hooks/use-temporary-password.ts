import { useCallback, useState } from 'react'
import { setTemporaryPasswordAction } from '@/core/actions/security/set-temporary-password.action'

interface TemporaryPasswordState {
  isLoading: boolean
  error: string | null
  password: string | null
}

export const useTemporaryPassword = () => {
  const [state, setState] = useState<TemporaryPasswordState>({
    isLoading: false,
    error: null,
    password: null,
  })

  const generate = useCallback(async (userId: string, temporaryPassword: string) => {
    setState({ isLoading: true, error: null, password: null })
    const result = await setTemporaryPasswordAction({ userId, temporaryPassword })
    if (result.success) {
      setState({ isLoading: false, error: null, password: result.data })
      return { success: true, password: result.data }
    }
    setState({ isLoading: false, error: result.error, password: null })
    return { success: false, error: result.error }
  }, [])

  return {
    ...state,
    generate,
  }
}
