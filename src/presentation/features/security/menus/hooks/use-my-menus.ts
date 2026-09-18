import { useCallback, useEffect, useRef, useState } from 'react'
import { GetMyMenusAction } from '@/core/actions/security-menus/get-my-menus-action'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'

interface UseMyMenusState {
  menus: MenuItemTreeDto[]
  isLoading: boolean
  error: string | null
  isLoaded: boolean
}

export const useMyMenus = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const cacheRef = useRef<MenuItemTreeDto[] | null>(null)
  const [state, setState] = useState<UseMyMenusState>({
    menus: cacheRef.current ?? [],
    isLoading: false,
    error: null,
    isLoaded: false,
  })

  const fetchMenus = useCallback(
    async (force?: boolean) => {
      if (!enabled) {
        cacheRef.current = null
        setState({ menus: [], isLoading: false, error: null, isLoaded: false })
        return
      }

      if (!force && cacheRef.current) {
        setState({
          menus: cacheRef.current,
          isLoading: false,
          error: null,
          isLoaded: true,
        })
        return
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isLoaded: false,
      }))
      const result = await new GetMyMenusAction().execute()
      if (result.success) {
        cacheRef.current = result.data
        setState({
          menus: result.data,
          isLoading: false,
          error: null,
          isLoaded: true,
        })
      } else {
        setState({
          menus: cacheRef.current ?? [],
          isLoading: false,
          error: result.error,
          isLoaded: Boolean(cacheRef.current),
        })
      }
    },
    [enabled],
  )

  useEffect(() => {
    void fetchMenus()
  }, [fetchMenus])

  const refetch = useCallback(async () => {
    await fetchMenus(true)
  }, [fetchMenus])

  return {
    menus: state.menus,
    isLoading: state.isLoading,
    error: state.error,
    isLoaded: state.isLoaded,
    refetch,
  }
}
