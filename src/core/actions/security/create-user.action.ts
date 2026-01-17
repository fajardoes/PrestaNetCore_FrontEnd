import { securityApi, type CreateUserPayload } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

export type CreateUserResult = ApiResult<SecurityUser>

export const createUserAction = async (
  payload: CreateUserPayload,
): Promise<CreateUserResult> => {
  try {
    const user = await securityApi.createUser(payload)
    return { success: true, data: user }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible crear el usuario. Verifica la información ingresada.',
    )
  }
}
