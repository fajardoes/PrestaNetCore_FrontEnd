export interface StoredRecentNavigation {
  path: string
  visitedAt: number
}

const RECENT_NAVIGATION_STORAGE_PREFIX = 'prestanet:recent-navigation:'
const LEGACY_RECENT_MENUS_STORAGE_PREFIX = 'prestanet:recent-menus:'
const RECENT_MENUS_VISIBILITY_PREFIX = 'prestanet:recent-menus-visibility:'

const getUserStorageKey = (prefix: string, userId?: string | null) => {
  const normalizedUserId = userId?.trim()
  return normalizedUserId ? `${prefix}${normalizedUserId}` : null
}

export const getRecentNavigationStorageKey = (userId?: string | null) =>
  getUserStorageKey(RECENT_NAVIGATION_STORAGE_PREFIX, userId)

export const getLegacyRecentMenusStorageKey = (userId?: string | null) =>
  getUserStorageKey(LEGACY_RECENT_MENUS_STORAGE_PREFIX, userId)

export const getRecentMenusVisibilityStorageKey = (userId?: string | null) =>
  getUserStorageKey(RECENT_MENUS_VISIBILITY_PREFIX, userId)

const parseStoredArray = (storageKey: string): unknown[] | null => {
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) return null

    const parsedValue: unknown = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

export const readStoredRecentNavigation = (
  storageKey: string,
): StoredRecentNavigation[] | null => {
  const parsedValue = parseStoredArray(storageKey)
  if (!parsedValue) return null

  return parsedValue.flatMap((item): StoredRecentNavigation[] => {
    if (
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      typeof item.path === 'string' &&
      item.path.trim().length > 0 &&
      'visitedAt' in item &&
      typeof item.visitedAt === 'number' &&
      Number.isFinite(item.visitedAt)
    ) {
      return [{ path: item.path, visitedAt: item.visitedAt }]
    }
    return []
  })
}

export interface LegacyRecentMenuRecord {
  id: string
}

export const readLegacyRecentMenus = (
  storageKey: string,
): LegacyRecentMenuRecord[] => {
  const parsedValue = parseStoredArray(storageKey)
  if (!parsedValue) return []

  return parsedValue.flatMap((item): LegacyRecentMenuRecord[] => {
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
}

export const writeStoredRecentNavigation = (
  storageKey: string,
  items: StoredRecentNavigation[],
) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(items))
  } catch {
    // localStorage puede estar bloqueado o no disponible; el estado en memoria sigue funcionando.
  }
}

export const readRecentMenusVisibility = (storageKey: string) => {
  if (typeof window === 'undefined') return true

  try {
    return window.localStorage.getItem(storageKey) !== 'false'
  } catch {
    return true
  }
}

export const writeRecentMenusVisibility = (storageKey: string, isVisible: boolean) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(storageKey, String(isVisible))
  } catch {
    // localStorage puede estar bloqueado o no disponible; el estado en memoria sigue funcionando.
  }
}
