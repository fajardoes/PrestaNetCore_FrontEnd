import {
  securityApi,
  type AssignRolesPayload,
} from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export interface AssignRolesParams {
  userId: string
  roles: string[]
}

export type AssignRolesResult = ApiResult<string[]>

export const assignRolesAction = async ({
  userId,
  roles,
}: AssignRolesParams): Promise<AssignRolesResult> => {
  try {
    const payload: AssignRolesPayload = { roles }
    const updatedRoles = await securityApi.assignRoles(userId, payload)
    const normalizedRoles = Array.isArray(updatedRoles)
      ? updatedRoles.map((role) => ('name' in role ? (role as { name: string }).name : String(role)))
      : roles

    return { success: true, data: normalizedRoles }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible asignar los roles.',
    )
  }
}
