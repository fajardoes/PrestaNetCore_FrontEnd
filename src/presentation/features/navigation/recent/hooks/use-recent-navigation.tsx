import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import type { RecentMenuItem } from '@/types/recent-menu'
import {
  createAuthorizedRecentMenus,
  filterAuthorizedRecentNavigation,
  findCurrentRecentMenu,
  haveSameStoredRecentNavigation,
  migrateLegacyRecentMenus,
  normalizeNavigationPath,
  normalizeStoredRecentNavigation,
  toRecentMenuItems,
} from '../recent-navigation-helpers'
import {
  getLegacyRecentMenusStorageKey,
  getRecentMenusVisibilityStorageKey,
  getRecentNavigationStorageKey,
  readLegacyRecentMenus,
  readRecentMenusVisibility,
  readStoredRecentNavigation,
  writeRecentMenusVisibility,
  writeStoredRecentNavigation,
  type StoredRecentNavigation,
} from '../recent-navigation-storage'

interface RecentNavigationContextValue {
  recentItems: RecentMenuItem[]
  activeItemId: string | null
  isVisible: boolean
  toggleVisibility: () => void
  registerVisit: (path: string) => void
  clearRecent: () => void
  removeRecent: (path: string) => void
}

interface RecentNavigationProviderProps {
  children: ReactNode
  menus: MenuItemTreeDto[]
  userId?: string | null
  enabled?: boolean
  menusReady?: boolean
}

const RecentNavigationContext = createContext<RecentNavigationContextValue | null>(null)

export const RecentNavigationProvider = ({
  children,
  menus,
  userId,
  enabled = true,
  menusReady = true,
}: RecentNavigationProviderProps) => {
  const location = useLocation()
  const storageKey = enabled ? getRecentNavigationStorageKey(userId) : null
  const legacyStorageKey = enabled ? getLegacyRecentMenusStorageKey(userId) : null
  const visibilityStorageKey = enabled
    ? getRecentMenusVisibilityStorageKey(userId)
    : null
  const authorizedMenus = useMemo(() => createAuthorizedRecentMenus(menus), [menus])
  const currentMenu = useMemo(
    () =>
      menusReady && enabled
        ? findCurrentRecentMenu(menus, authorizedMenus, location.pathname)
        : null,
    [authorizedMenus, enabled, location.pathname, menus, menusReady],
  )
  const [storedItems, setStoredItems] = useState<StoredRecentNavigation[]>([])
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hydratedVisibilityKey, setHydratedVisibilityKey] = useState<string | null>(null)
  const loadedStorageKeyRef = useRef<string | null>(null)
  const loadedVisibilityKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!storageKey) {
      loadedStorageKeyRef.current = null
      setHydratedStorageKey(null)
      setStoredItems([])
      return
    }

    if (!menusReady) return

    if (loadedStorageKeyRef.current !== storageKey) {
      const storedItems = readStoredRecentNavigation(storageKey)
      const legacyItems = legacyStorageKey
        ? readLegacyRecentMenus(legacyStorageKey)
        : []
      const initialItems =
        storedItems ?? migrateLegacyRecentMenus(legacyItems, authorizedMenus)
      const normalizedItems = filterAuthorizedRecentNavigation(
        normalizeStoredRecentNavigation(initialItems),
        authorizedMenus,
      )

      loadedStorageKeyRef.current = storageKey
      setHydratedStorageKey(storageKey)
      setStoredItems(normalizedItems)
      return
    }

    setStoredItems((current) => {
      const normalizedItems = filterAuthorizedRecentNavigation(current, authorizedMenus)
      return haveSameStoredRecentNavigation(current, normalizedItems)
        ? current
        : normalizedItems
    })
  }, [authorizedMenus, legacyStorageKey, menusReady, storageKey])

  useEffect(() => {
    if (!visibilityStorageKey) {
      loadedVisibilityKeyRef.current = null
      setHydratedVisibilityKey(null)
      setIsVisible(true)
      return
    }

    if (loadedVisibilityKeyRef.current === visibilityStorageKey) return

    loadedVisibilityKeyRef.current = visibilityStorageKey
    setHydratedVisibilityKey(visibilityStorageKey)
    setIsVisible(readRecentMenusVisibility(visibilityStorageKey))
  }, [visibilityStorageKey])

  const registerVisit = useCallback(
    (path: string) => {
      if (
        !storageKey ||
        !menusReady ||
        loadedStorageKeyRef.current !== storageKey
      ) {
        return
      }

      const menu = findCurrentRecentMenu(menus, authorizedMenus, path)
      if (!menu) return

      setStoredItems((current) =>
        normalizeStoredRecentNavigation([
          { path: menu.path, visitedAt: Date.now() },
          ...current.filter((item) => item.path !== menu.path),
        ]),
      )
    },
    [authorizedMenus, menus, menusReady, storageKey],
  )

  const clearRecent = useCallback(() => {
    setStoredItems([])
  }, [])

  const removeRecent = useCallback((path: string) => {
    const normalizedPath = normalizeNavigationPath(path)
    setStoredItems((current) =>
      current.filter((item) => item.path !== normalizedPath),
    )
  }, [])

  const toggleVisibility = useCallback(() => {
    setIsVisible((current) => !current)
  }, [])

  useEffect(() => {
    if (
      !storageKey ||
      hydratedStorageKey !== storageKey ||
      loadedStorageKeyRef.current !== storageKey
    ) {
      return
    }

    writeStoredRecentNavigation(storageKey, storedItems)
  }, [hydratedStorageKey, storageKey, storedItems])

  useEffect(() => {
    if (
      !visibilityStorageKey ||
      hydratedVisibilityKey !== visibilityStorageKey ||
      loadedVisibilityKeyRef.current !== visibilityStorageKey
    ) {
      return
    }

    writeRecentMenusVisibility(visibilityStorageKey, isVisible)
  }, [hydratedVisibilityKey, isVisible, visibilityStorageKey])

  useEffect(() => {
    if (currentMenu) registerVisit(currentMenu.path)
  }, [currentMenu, registerVisit])

  const value = useMemo<RecentNavigationContextValue>(
    () => ({
      recentItems: toRecentMenuItems(storedItems, authorizedMenus),
      activeItemId: currentMenu?.id ?? null,
      isVisible:
        !visibilityStorageKey || hydratedVisibilityKey !== visibilityStorageKey
          ? true
          : isVisible,
      toggleVisibility,
      registerVisit,
      clearRecent,
      removeRecent,
    }),
    [
      authorizedMenus,
      clearRecent,
      currentMenu,
      hydratedVisibilityKey,
      isVisible,
      registerVisit,
      removeRecent,
      storedItems,
      toggleVisibility,
      visibilityStorageKey,
    ],
  )

  return (
    <RecentNavigationContext.Provider value={value}>
      {children}
    </RecentNavigationContext.Provider>
  )
}

export const useRecentNavigation = () => {
  const context = useContext(RecentNavigationContext)
  if (!context) {
    throw new Error('useRecentNavigation debe ser usado dentro de RecentNavigationProvider')
  }
  return context
}
