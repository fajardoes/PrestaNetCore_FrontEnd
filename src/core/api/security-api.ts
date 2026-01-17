import { httpClient } from '@/infrastructure/api/httpClient'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

export interface UpdateUserPayload {
  email: string
  phoneNumber?: string | null
  isDeleted: boolean
  agencyId: string
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
  ): Promise<SecurityRole[]> {
    const { data } = await httpClient.put<SecurityRole[]>(
      `/auth/users/${userId}/roles`,
      payload,
    )
    return data
  },

  async getRoles(): Promise<SecurityRole[]> {
    const { data } = await httpClient.get<SecurityRole[]>('/auth/roles')
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
