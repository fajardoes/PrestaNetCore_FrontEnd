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
  for (const item of menus) {
    if (isItemActive(item, pathname)) {
      return item
    }
  }
  return null
}
