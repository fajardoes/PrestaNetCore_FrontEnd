import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { findBestMenuItem } from '@/presentation/share/helpers/menu-tree'
import type { RecentMenuItem } from '@/types/recent-menu'
import type { LegacyRecentMenuRecord, StoredRecentNavigation } from './recent-navigation-storage'

export const MAX_RECENT_NAVIGATION = 8

export interface AuthorizedRecentMenu {
  id: string
  label: string
  path: string
  icon: string | null
  parentLabel: string | null
}

export interface AuthorizedRecentMenus {
  byId: Map<string, AuthorizedRecentMenu>
  byPath: Map<string, AuthorizedRecentMenu>
}

export const normalizeNavigationPath = (path: string) => {
  if (path === '/') return path
  const withoutTrailingSlash = path.replace(/\/+$/, '')
  return withoutTrailingSlash || '/'
}

export const isExcludedRecentPath = (path: string) => {
  const normalizedPath = normalizeNavigationPath(path)
  return (
    normalizedPath === '/' ||
    normalizedPath === '/auth/login' ||
    normalizedPath === '/auth/logout' ||
    normalizedPath === '/403' ||
    normalizedPath === '/404' ||
    normalizedPath === '/error' ||
    normalizedPath.startsWith('/403/') ||
    normalizedPath.startsWith('/404/') ||
    normalizedPath.startsWith('/error/')
  )
}

const createAuthorizedRecentMenu = (
  item: MenuItemTreeDto,
  parentLabel: string | null,
): AuthorizedRecentMenu | null => {
  if (!item.route || isExcludedRecentPath(item.route)) return null

  return {
    id: item.id,
    label: item.title,
    path: normalizeNavigationPath(item.route),
    icon: item.icon,
    parentLabel,
  }
}

const isConcreteMenuRoute = (path: string) =>
  !path.split('/').some((segment) => segment.startsWith(':') || segment === '*')

export const createAuthorizedRecentMenus = (
  menus: MenuItemTreeDto[],
): AuthorizedRecentMenus => {
  const byId = new Map<string, AuthorizedRecentMenu>()
  const byPath = new Map<string, AuthorizedRecentMenu>()

  const visit = (
    items: MenuItemTreeDto[],
    parentLabel: string | null,
    parentRecentMenu: AuthorizedRecentMenu | null,
  ) => {
    items.forEach((item) => {
      const recentMenu = createAuthorizedRecentMenu(item, parentLabel)
      const resolvedRecentMenu =
        recentMenu && isConcreteMenuRoute(recentMenu.path)
          ? recentMenu
          : parentRecentMenu

      if (recentMenu && resolvedRecentMenu) {
        byId.set(recentMenu.id, resolvedRecentMenu)
      }
      if (recentMenu && isConcreteMenuRoute(recentMenu.path)) {
        byPath.set(recentMenu.path, recentMenu)
      }
      visit(item.children ?? [], item.title, resolvedRecentMenu)
    })
  }

  visit(menus, null, null)
  return { byId, byPath }
}

const compareStoredRecentNavigation = (
  first: StoredRecentNavigation,
  second: StoredRecentNavigation,
) => second.visitedAt - first.visitedAt

export const normalizeStoredRecentNavigation = (
  items: StoredRecentNavigation[],
): StoredRecentNavigation[] => {
  const byPath = new Map<string, StoredRecentNavigation>()

  items.forEach((item) => {
    const path = normalizeNavigationPath(item.path)
    if (
      isExcludedRecentPath(path) ||
      !Number.isFinite(item.visitedAt) ||
      item.visitedAt < 0
    ) {
      return
    }

    const current = byPath.get(path)
    if (!current || item.visitedAt > current.visitedAt) {
      byPath.set(path, { path, visitedAt: item.visitedAt })
    }
  })

  return Array.from(byPath.values())
    .sort(compareStoredRecentNavigation)
    .slice(0, MAX_RECENT_NAVIGATION)
}

export const filterAuthorizedRecentNavigation = (
  items: StoredRecentNavigation[],
  authorizedMenus: AuthorizedRecentMenus,
) =>
  normalizeStoredRecentNavigation(items).filter((item) =>
    authorizedMenus.byPath.has(item.path),
  )

export const toRecentMenuItem = (
  item: StoredRecentNavigation,
  authorizedMenus: AuthorizedRecentMenus,
): RecentMenuItem | null => {
  const authorizedMenu = authorizedMenus.byPath.get(item.path)
  if (!authorizedMenu) return null

  return {
    ...authorizedMenu,
    visitedAt: item.visitedAt,
  }
}

export const toRecentMenuItems = (
  items: StoredRecentNavigation[],
  authorizedMenus: AuthorizedRecentMenus,
) =>
  filterAuthorizedRecentNavigation(items, authorizedMenus)
    .map((item) => toRecentMenuItem(item, authorizedMenus))
    .filter((item): item is RecentMenuItem => item !== null)

export const migrateLegacyRecentMenus = (
  items: LegacyRecentMenuRecord[],
  authorizedMenus: AuthorizedRecentMenus,
  now = Date.now(),
): StoredRecentNavigation[] =>
  normalizeStoredRecentNavigation(
    items.flatMap((item, index): StoredRecentNavigation[] => {
      const authorizedMenu = authorizedMenus.byId.get(item.id)
      if (!authorizedMenu) return []

      return [
        {
          path: authorizedMenu.path,
          // La estructura anterior no guardaba fecha; se conserva el orden original.
          visitedAt: Math.max(0, now - index),
        },
      ]
    }),
  )

export const findCurrentRecentMenu = (
  menus: MenuItemTreeDto[],
  authorizedMenus: AuthorizedRecentMenus,
  pathname: string,
) => {
  if (isExcludedRecentPath(pathname)) return null

  const currentMenu = findBestMenuItem(menus, pathname)
  return currentMenu ? authorizedMenus.byId.get(currentMenu.id) ?? null : null
}

export const haveSameStoredRecentNavigation = (
  first: StoredRecentNavigation[],
  second: StoredRecentNavigation[],
) =>
  first.length === second.length &&
  first.every(
    (item, index) =>
      item.path === second[index]?.path &&
      item.visitedAt === second[index]?.visitedAt,
  )
