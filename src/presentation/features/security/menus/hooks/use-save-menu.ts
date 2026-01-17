import { useCallback, useState } from 'react'
import { CreateAdminMenuAction } from '@/core/actions/security-menus/create-admin-menu-action'
import { UpdateAdminMenuAction } from '@/core/actions/security-menus/update-admin-menu-action'
import type {
  MenuItemAdminDto,
  MenuItemAdminPayload,
} from '@/infrastructure/interfaces/security/menu'

interface SaveMenuState {
  isSaving: boolean
  error: string | null
  lastSaved?: MenuItemAdminDto
}

export const useSaveMenu = () => {
  const [state, setState] = useState<SaveMenuState>({
    isSaving: false,
    error: null,
  })

  const createMenu = useCallback(async (payload: MenuItemAdminPayload) => {
    setState({ isSaving: true, error: null })
    const result = await new CreateAdminMenuAction().execute(payload)
    if (result.success) {
      setState({ isSaving: false, error: null, lastSaved: result.data })
      return { success: true, menu: result.data }
    }
    setState({ isSaving: false, error: result.error })
    return { success: false, error: result.error }
  }, [])

  const updateMenu = useCallback(
    async (menuId: string, payload: MenuItemAdminPayload) => {
      setState({ isSaving: true, error: null })
      const result = await new UpdateAdminMenuAction().execute(menuId, payload)
      if (result.success) {
        setState({ isSaving: false, error: null, lastSaved: result.data })
        return { success: true, menu: result.data }
      }
      setState({ isSaving: false, error: result.error })
      return { success: false, error: result.error }
    },
    [],
  )

  return {
    ...state,
    createMenu,
    updateMenu,
  }
}
