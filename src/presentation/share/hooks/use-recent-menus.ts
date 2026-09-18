import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { findBestMenuItem } from '@/presentation/share/helpers/menu-tree'
import type { RecentMenuItem } from '@/types/recent-menu'

const MAX_RECENT_MENUS = 6
const RECENT_MENUS_STORAGE_PREFIX = 'prestanet:recent-menus:'
const RECENT_MENUS_VISIBILITY_PREFIX = 'prestanet:recent-menus-visibility:'

interface UseRecentMenusOptions {
  menus: MenuItemTreeDto[]
  userId?: string | null
  enabled?: boolean
  menusReady?: boolean
}

type StoredRecentMenu = Pick<RecentMenuItem, 'id'>

const getStorageKey = (userId: string | null | undefined) => {
  const normalizedUserId = userId?.trim()
  return normalizedUserId
    ? `${RECENT_MENUS_STORAGE_PREFIX}${normalizedUserId}`
    : null
}

const getVisibilityStorageKey = (userId: string | null | undefined) => {
  const normalizedUserId = userId?.trim()
  return normalizedUserId
    ? `${RECENT_MENUS_VISIBILITY_PREFIX}${normalizedUserId}`
    : null
}

const buildRecentMenu = (menu: MenuItemTreeDto): RecentMenuItem | null => {
  if (!menu.route) return null
  return {
    id: menu.id,
    label: menu.title,
    path: menu.route,
  }
}

const haveSameRecentMenus = (
  current: RecentMenuItem[],
  next: RecentMenuItem[],
) =>
  current.length === next.length &&
  current.every(
    (item, index) =>
      item.id === next[index]?.id &&
      item.label === next[index]?.label &&
      item.path === next[index]?.path,
  )

const normalizeRecentMenus = (
  items: StoredRecentMenu[],
  authorizedMenus: Map<string, MenuItemTreeDto>,
): RecentMenuItem[] => {
  const normalized: RecentMenuItem[] = []
  const seenIds = new Set<string>()

  for (const item of items) {
    if (seenIds.has(item.id)) continue
    const authorizedMenu = authorizedMenus.get(item.id)
    const recentMenu = authorizedMenu ? buildRecentMenu(authorizedMenu) : null
    if (!recentMenu) continue

    seenIds.add(item.id)
    normalized.push(recentMenu)
    if (normalized.length === MAX_RECENT_MENUS) break
  }

  return normalized
}

const readStoredRecentMenus = (storageKey: string): StoredRecentMenu[] => {
  if (typeof window === 'undefined') return []

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) return []

    const parsedValue: unknown = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue.flatMap((item): StoredRecentMenu[] => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        item.id.trim().length > 0
      ) {
        return [{ id: item.id }]
      }
      return []
    })
  } catch {
    return []
  }
}

const readStoredVisibility = (storageKey: string) => {
  if (typeof window === 'undefined') return true

  try {
    return window.localStorage.getItem(storageKey) !== 'false'
  } catch {
    return true
  }
}

export const useRecentMenus = ({
  menus,
  userId,
  enabled = true,
  menusReady = true,
}: UseRecentMenusOptions) => {
  const location = useLocation()
  const storageKey = enabled ? getStorageKey(userId) : null
  const visibilityStorageKey = enabled ? getVisibilityStorageKey(userId) : null
  const [recentMenus, setRecentMenus] = useState<RecentMenuItem[]>([])
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hydratedVisibilityKey, setHydratedVisibilityKey] = useState<string | null>(null)
  const loadedStorageKeyRef = useRef<string | null>(null)
  const loadedVisibilityKeyRef = useRef<string | null>(null)

  const authorizedMenus = useMemo(() => {
    const map = new Map<string, MenuItemTreeDto>()

    const visit = (items: MenuItemTreeDto[]) => {
      items.forEach((item) => {
        if (item.route) map.set(item.id, item)
        visit(item.children ?? [])
      })
    }

    visit(menus)
    return map
  }, [menus])

  const currentMenu = useMemo(
    () =>
      menusReady && enabled
        ? findBestMenuItem(menus, location.pathname)
        : null,
    [enabled, location.pathname, menus, menusReady],
  )

  useEffect(() => {
    if (!storageKey) {
      loadedStorageKeyRef.current = null
      setHydratedStorageKey((current) => (current === null ? current : null))
      setRecentMenus((current) => (current.length === 0 ? current : []))
      return
    }

    if (!menusReady) return

    if (loadedStorageKeyRef.current !== storageKey) {
      const storedMenus = readStoredRecentMenus(storageKey)
      const normalizedMenus = normalizeRecentMenus(storedMenus, authorizedMenus)
      loadedStorageKeyRef.current = storageKey
      setHydratedStorageKey(storageKey)
      setRecentMenus((current) =>
        haveSameRecentMenus(current, normalizedMenus) ? current : normalizedMenus,
      )
      return
    }

    setRecentMenus((current) => {
      const normalizedMenus = normalizeRecentMenus(current, authorizedMenus)
      return haveSameRecentMenus(current, normalizedMenus) ? current : normalizedMenus
    })
  }, [authorizedMenus, menusReady, storageKey])

  useEffect(() => {
    if (!visibilityStorageKey) {
      loadedVisibilityKeyRef.current = null
      setHydratedVisibilityKey((current) => (current === null ? current : null))
      setIsVisible((current) => (current ? current : true))
      return
    }

    if (loadedVisibilityKeyRef.current === visibilityStorageKey) return

    loadedVisibilityKeyRef.current = visibilityStorageKey
    setHydratedVisibilityKey(visibilityStorageKey)
    setIsVisible(readStoredVisibility(visibilityStorageKey))
  }, [visibilityStorageKey])

  const visitMenu = useCallback(
    (menuId: string) => {
      if (!storageKey || !menusReady || loadedStorageKeyRef.current !== storageKey) {
        return
      }

      const menu = authorizedMenus.get(menuId)
      const recentMenu = menu ? buildRecentMenu(menu) : null
      if (!recentMenu) return

      setRecentMenus((current) => {
        const next = [
          recentMenu,
          ...current.filter((item) => item.id !== recentMenu.id),
        ].slice(0, MAX_RECENT_MENUS)
        return haveSameRecentMenus(current, next) ? current : next
      })
    },
    [authorizedMenus, menusReady, storageKey],
  )

  const toggleVisibility = useCallback(() => {
    setIsVisible((current) => !current)
  }, [])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !storageKey ||
      hydratedStorageKey !== storageKey ||
      loadedStorageKeyRef.current !== storageKey
    ) {
      return
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(recentMenus))
    } catch {
      // localStorage puede estar bloqueado o no disponible; el estado en memoria sigue funcionando.
    }
  }, [hydratedStorageKey, recentMenus, storageKey])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !visibilityStorageKey ||
      hydratedVisibilityKey !== visibilityStorageKey ||
      loadedVisibilityKeyRef.current !== visibilityStorageKey
    ) {
      return
    }

    try {
      window.localStorage.setItem(visibilityStorageKey, String(isVisible))
    } catch {
      // localStorage puede estar bloqueado o no disponible; el estado en memoria sigue funcionando.
    }
  }, [hydratedVisibilityKey, isVisible, visibilityStorageKey])

  useEffect(() => {
    if (currentMenu) visitMenu(currentMenu.id)
  }, [currentMenu, visitMenu])

  const visibleRecentMenus = useMemo(() => {
    if (
      !enabled ||
      !menusReady ||
      hydratedStorageKey !== storageKey
    ) {
      return []
    }

    return normalizeRecentMenus(recentMenus, authorizedMenus)
  }, [
    authorizedMenus,
    enabled,
    hydratedStorageKey,
    menusReady,
    recentMenus,
    storageKey,
  ])

  return {
    recentMenus: visibleRecentMenus,
    activeMenuId: currentMenu?.id ?? null,
    isVisible:
      !visibilityStorageKey || hydratedVisibilityKey !== visibilityStorageKey
        ? true
        : isVisible,
    toggleVisibility,
    visitMenu,
  }
}
