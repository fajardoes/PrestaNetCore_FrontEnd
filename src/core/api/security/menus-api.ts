import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  MenuItemAdminDto,
  MenuItemAdminPayload,
  MenuItemTreeDto,
} from '@/infrastructure/interfaces/security/menu'

export const getMyMenus = async (): Promise<MenuItemTreeDto[]> => {
  const { data } = await httpClient.get<MenuItemTreeDto[]>('/menus/my')
  return data
}

export const listAdminMenus = async (): Promise<MenuItemAdminDto[]> => {
  const { data } = await httpClient.get<MenuItemAdminDto[]>('/admin/menus')
  return data
}

export const getAdminMenu = async (
  menuId: string,
): Promise<MenuItemAdminDto> => {
  const { data } = await httpClient.get<MenuItemAdminDto>(
    `/admin/menus/${menuId}`,
  )
  return data
}

export const createAdminMenu = async (
  payload: MenuItemAdminPayload,
): Promise<MenuItemAdminDto> => {
  const { data } = await httpClient.post<MenuItemAdminDto>(
    '/admin/menus',
    payload,
  )
  return data
}

export const updateAdminMenu = async (
  menuId: string,
  payload: MenuItemAdminPayload,
): Promise<MenuItemAdminDto> => {
  const { data } = await httpClient.put<MenuItemAdminDto>(
    `/admin/menus/${menuId}`,
    payload,
  )
  return data
}

export const deleteAdminMenu = async (menuId: string): Promise<void> => {
  await httpClient.delete(`/admin/menus/${menuId}`)
}
