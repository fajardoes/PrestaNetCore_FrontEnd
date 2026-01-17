import {
  securityApi,
  type UpdateUserPayload,
} from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

export interface UpdateUserParams {
  userId: string
  payload: UpdateUserPayload
}

export type UpdateUserResult = ApiResult<SecurityUser>

export const updateUserAction = async ({
  userId,
  payload,
}: UpdateUserParams): Promise<UpdateUserResult> => {
  try {
    const user = await securityApi.updateUser(userId, payload)
    return { success: true, data: user }
  } catch (error) {
    return toApiError<undefined>(
      error,
      'No fue posible actualizar el usuario.',
    )
  }
}
