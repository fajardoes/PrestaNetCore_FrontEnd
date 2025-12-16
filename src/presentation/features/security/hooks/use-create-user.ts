import { useCallback, useState } from 'react'
import { createUserAction } from '@/core/actions/security/create-user.action'
import type { CreateUserPayload } from '@/core/api/security-api'

interface CreateUserState {
  isSaving: boolean
  error: string | null
}

export const useCreateUser = () => {
  const [state, setState] = useState<CreateUserState>({
    isSaving: false,
    error: null,
  })

  const createUser = useCallback(async (payload: CreateUserPayload) => {
    setState({ isSaving: true, error: null })
    const result = await createUserAction(payload)
    if (result.success) {
      setState({ isSaving: false, error: null })
      return { success: true, user: result.data }
    }
    setState({ isSaving: false, error: result.error })
    return { success: false, error: result.error }
  }, [])

  return {
    ...state,
    createUser,
  }
}
