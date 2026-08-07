import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'

export const isRouteActive = (route: string | null, pathname: string) => {
  if (!route) return false
  if (route === '/') return pathname === '/'
  return pathname === route || pathname.startsWith(`${route}/`)
}

export const isRouteExact = (route: string | null, pathname: string) => {
  if (!route) return false
  if (route === '/') return pathname === '/'
  return pathname === route
}

export const isItemActive = (item: MenuItemTreeDto, pathname: string): boolean => {
  if (isRouteActive(item.route, pathname)) return true
  return item.children.some((child) => isItemActive(child, pathname))
}

const getActiveRouteScore = (item: MenuItemTreeDto, pathname: string): number => {
  const selfScore = isRouteActive(item.route, pathname) ? item.route?.length ?? 0 : 0
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
