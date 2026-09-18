import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'

const normalizePath = (path: string) => {
  if (path === '/') return path
  const withoutTrailingSlash = path.replace(/\/+$/, '')
  return withoutTrailingSlash || '/'
}

const splitPath = (path: string) => {
  const normalizedPath = normalizePath(path)
  return normalizedPath === '/' ? [] : normalizedPath.split('/').filter(Boolean)
}

/**
 * Returns a specificity score when a menu route can represent the current
 * pathname. Static route segments are matched literally; :parameters and *
 * are also supported so the same menu can represent a detail or edit screen.
 */
export const getRouteMatchScore = (
  route: string | null,
  pathname: string,
): number | null => {
  if (!route) return null

  const normalizedRoute = normalizePath(route)
  const routeParts = splitPath(normalizedRoute)
  const pathnameParts = splitPath(pathname)

  if (routeParts.length === 0) {
    return pathnameParts.length === 0 ? normalizedRoute.length : null
  }

  const wildcardIndex = routeParts.indexOf('*')
  if (wildcardIndex === 0 || (wildcardIndex !== -1 && wildcardIndex !== routeParts.length - 1)) {
    return null
  }

  const requiredRouteParts = wildcardIndex === -1 ? routeParts.length : wildcardIndex
  if (pathnameParts.length < requiredRouteParts) return null

  for (let index = 0; index < requiredRouteParts; index += 1) {
    const routePart = routeParts[index]
    const pathnamePart = pathnameParts[index]

    if (routePart.startsWith(':')) {
      if (!pathnamePart) return null
      continue
    }
    if (routePart !== pathnamePart) return null
  }

  const staticPartCount = routeParts
    .slice(0, requiredRouteParts)
    .filter((part) => !part.startsWith(':'))
    .length

  // Static segments have priority over parameters; depth and route length
  // break ties between otherwise equivalent candidates.
  return staticPartCount * 1_000_000 + requiredRouteParts * 1_000 + normalizedRoute.length
}

export const isRouteActive = (route: string | null, pathname: string) =>
  getRouteMatchScore(route, pathname) !== null

export const isRouteExact = (route: string | null, pathname: string) => {
  if (!route) return false
  return normalizePath(route) === normalizePath(pathname)
}

export const isItemActive = (item: MenuItemTreeDto, pathname: string): boolean => {
  if (isRouteActive(item.route, pathname)) return true
  return item.children.some((child) => isItemActive(child, pathname))
}

const getActiveRouteScore = (item: MenuItemTreeDto, pathname: string): number => {
  const selfScore = getRouteMatchScore(item.route, pathname) ?? 0
  return item.children.reduce(
    (bestScore, child) => Math.max(bestScore, getActiveRouteScore(child, pathname)),
    selfScore,
  )
}

export const sortMenuTree = (items: MenuItemTreeDto[]): MenuItemTreeDto[] => {
  return items
    .map((item) => ({
      ...item,
      children: sortMenuTree(item.children ?? []),
    }))
    .filter((item) => Boolean(item.route) || item.children.length > 0)
    .sort((a, b) => a.order - b.order)
}

export const findBestMenuItem = (
  menus: MenuItemTreeDto[],
  pathname: string,
): MenuItemTreeDto | null => {
  let bestItem: MenuItemTreeDto | null = null
  let bestScore = -1

  const visit = (items: MenuItemTreeDto[]) => {
    items.forEach((item) => {
      const score = getRouteMatchScore(item.route, pathname)
      if (score !== null && score > bestScore) {
        bestItem = item
        bestScore = score
      }
      visit(item.children ?? [])
    })
  }

  visit(menus)
  return bestItem
}

export const collectActiveGroups = (
  item: MenuItemTreeDto,
  pathname: string,
  activeGroups: Set<string>,
): boolean => {
  const childActive = item.children.some((child) =>
    collectActiveGroups(child, pathname, activeGroups),
  )
  const selfActive = isRouteActive(item.route, pathname)
  if (item.children.length > 0 && (selfActive || childActive)) {
    activeGroups.add(item.id)
  }
  return selfActive || childActive
}

export const findActiveRootMenu = (
  menus: MenuItemTreeDto[],
  pathname: string,
): MenuItemTreeDto | null => {
  let activeRoot: MenuItemTreeDto | null = null
  let bestScore = 0

  for (const item of menus) {
    const score = getActiveRouteScore(item, pathname)
    if (score > bestScore) {
      activeRoot = item
      bestScore = score
    }
  }

  return activeRoot
}
