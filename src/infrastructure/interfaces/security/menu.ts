export interface MenuItemTreeDto {
  id: string
  title: string
  slug: string
  route: string | null
  icon: string | null
  order: number
  children: MenuItemTreeDto[]
}

export interface MenuItemAdminDto {
  id: string
  title: string
  slug: string
  route: string | null
  icon: string | null
  order: number
  isActive: boolean
  parentId: string | null
  allowedRoleIds: string[]
  children?: MenuItemAdminDto[]
}

export interface MenuItemAdminPayload {
  title: string
  slug: string
  route: string | null
  icon: string | null
  order: number
  isActive: boolean
  parentId: string | null
  allowedRoleIds: string[]
}
