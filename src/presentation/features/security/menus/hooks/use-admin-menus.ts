import { useCallback, useEffect, useState } from 'react'
import { ListAdminMenusAction } from '@/core/actions/security-menus/list-admin-menus-action'
import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'

interface UseAdminMenusState {
  menus: MenuItemAdminDto[]
  isLoading: boolean
  error: string | null
}

export const useAdminMenus = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseAdminMenusState>({
    menus: [],
    isLoading: false,
    error: null,
  })

  const fetchMenus = useCallback(async () => {
    if (!enabled) {
      setState({ menus: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await new ListAdminMenusAction().execute()
    if (result.success) {
      setState({ menus: result.data, isLoading: false, error: null })
    } else {
      setState({ menus: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchMenus()
  }, [fetchMenus])

  return {
    menus: state.menus,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchMenus,
  }
}
