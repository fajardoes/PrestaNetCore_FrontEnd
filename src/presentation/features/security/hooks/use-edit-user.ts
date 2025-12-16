import { useCallback, useState } from 'react'
import { assignRolesAction } from '@/core/actions/security/assign-roles.action'
import { updateUserAction } from '@/core/actions/security/update-user.action'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

interface EditUserParams {
  userId: string
  email: string
  phoneNumber?: string | null
  isDeleted: boolean
  roles?: string[]
  agencyId: string
}

interface EditUserState {
  isSaving: boolean
  error: string | null
  lastUpdated?: SecurityUser
}

export const useEditUser = () => {
  const [state, setState] = useState<EditUserState>({
    isSaving: false,
    error: null,
  })

  const editUser = useCallback(async (params: EditUserParams) => {
    setState({ isSaving: true, error: null })

    const updateResult = await updateUserAction({
      userId: params.userId,
      payload: {
        email: params.email,
        phoneNumber: params.phoneNumber ?? null,
        isDeleted: params.isDeleted,
        agencyId: params.agencyId,
      },
    })

    if (!updateResult.success) {
      setState({ isSaving: false, error: updateResult.error })
      return { success: false, error: updateResult.error }
    }

    let updatedUser: SecurityUser = updateResult.data

    if (params.roles) {
      const rolesResult = await assignRolesAction({
        userId: params.userId,
        roles: params.roles,
      })

      if (!rolesResult.success) {
        setState({
          isSaving: false,
          error: rolesResult.error,
        })
        return { success: false, error: rolesResult.error }
      }

      updatedUser = { ...updatedUser, roles: rolesResult.data }
    }

    setState({ isSaving: false, error: null, lastUpdated: updatedUser })
    return { success: true, user: updatedUser }
  }, [])

  return {
    ...state,
    editUser,
  }
}
