import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'

export const flattenRouteItems = (items: MenuItemTreeDto[]): MenuItemTreeDto[] =>
  items.flatMap((item) => {
    const current = item.route && item.route !== '/' ? [item] : []
    return [...current, ...flattenRouteItems(item.children ?? [])]
  })
