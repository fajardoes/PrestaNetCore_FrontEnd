import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

export interface CreateRolePayload {
  name: string
}

export interface CreateRoleResult {
  succeeded: boolean
  failureReason?: string | null
  role: SecurityRole
}

export interface AssignUserRolesResult {
  succeeded: boolean
  failureReason?: string | null
  user: {
    userId: string
    email: string
    roles: string[]
  }
}
