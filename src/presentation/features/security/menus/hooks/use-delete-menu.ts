import { useCallback, useState } from 'react'
import { DeleteAdminMenuAction } from '@/core/actions/security-menus/delete-admin-menu-action'

interface DeleteMenuState {
  isDeleting: boolean
  error: string | null
}

export const useDeleteMenu = () => {
  const [state, setState] = useState<DeleteMenuState>({
    isDeleting: false,
    error: null,
  })

  const deleteMenu = useCallback(async (menuId: string) => {
    setState({ isDeleting: true, error: null })
    const result = await new DeleteAdminMenuAction().execute(menuId)
    if (result.success) {
      setState({ isDeleting: false, error: null })
      return { success: true }
    }
    setState({ isDeleting: false, error: result.error })
    return { success: false, error: result.error }
  }, [])

  return {
    ...state,
    deleteMenu,
  }
}
