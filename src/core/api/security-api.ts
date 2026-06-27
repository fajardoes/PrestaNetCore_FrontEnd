import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  AssignUserRolesResult,
  CreateRolePayload,
  CreateRoleResult,
} from '@/infrastructure/interfaces/security/role-create'
import type {
  SecurityPermissionCatalogItem,
  SecurityRolePermissions,
  UpdateRolePermissionsPayload,
  UpdateRolePermissionsResult,
} from '@/infrastructure/interfaces/security/role-permission'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

export interface UpdateUserPayload {
  email: string
  phoneNumber?: string | null
  isDeleted: boolean
  agencyId: string
  queryOfficeIds?: string[]
}

export interface AssignRolesPayload {
  roles: string[]
}

export interface TemporaryPasswordResponse {
  temporaryPassword: string
}

export interface CreateUserPayload {
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string | null
  roles?: string[]
  agencyId: string
  queryOfficeIds?: string[]
}

export const securityApi = {
  async listUsers(): Promise<SecurityUser[]> {
    const { data } = await httpClient.get<SecurityUser[]>('/auth/users')
    return data
  },

  async updateUser(
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<SecurityUser> {
    const { data } = await httpClient.put<SecurityUser>(
      `/auth/users/${userId}`,
      payload,
    )
    return data
  },

  async assignRoles(
    userId: string,
    payload: AssignRolesPayload,
  ): Promise<string[]> {
    const { data } = await httpClient.put<SecurityRole[] | AssignUserRolesResult>(
      `/auth/users/${userId}/roles`,
      payload,
    )
    if (Array.isArray(data)) {
      return data.map((role) =>
        typeof role === 'string' ? role : role.name,
      )
    }
    if (data?.user && Array.isArray(data.user.roles)) {
      return data.user.roles
    }
    return payload.roles
  },

  async getRoles(): Promise<SecurityRole[]> {
    const { data } = await httpClient.get<SecurityRole[]>('/auth/roles')
    return data
  },

  async createRole(payload: CreateRolePayload): Promise<CreateRoleResult> {
    const { data } = await httpClient.post<CreateRoleResult>('/auth/roles', payload)
    return data
  },

  async listPermissions(): Promise<SecurityPermissionCatalogItem[]> {
    const { data } = await httpClient.get<SecurityPermissionCatalogItem[]>(
      '/auth/permissions',
    )
    return data
  },

  async getRolePermissions(roleName: string): Promise<SecurityRolePermissions> {
    const { data } = await httpClient.get<SecurityRolePermissions>(
      `/auth/roles/${encodeURIComponent(roleName)}/permissions`,
    )
    return data
  },

  async updateRolePermissions(
    roleName: string,
    payload: UpdateRolePermissionsPayload,
  ): Promise<UpdateRolePermissionsResult> {
    const { data } = await httpClient.put<UpdateRolePermissionsResult>(
      `/auth/roles/${encodeURIComponent(roleName)}/permissions`,
      payload,
    )
    return data
  },

  async setTemporaryPassword(
    userId: string,
    temporaryPassword: string,
  ): Promise<TemporaryPasswordResponse> {
    const { data } = await httpClient.post<TemporaryPasswordResponse>(
      `/auth/users/${userId}/temporary_password`,
      { temporaryPassword },
    )
    return data
  },

  async createUser(payload: CreateUserPayload): Promise<SecurityUser> {
    const { data } = await httpClient.post<SecurityUser>(
      '/auth/create_user',
      payload,
    )
    return data
  },
}
