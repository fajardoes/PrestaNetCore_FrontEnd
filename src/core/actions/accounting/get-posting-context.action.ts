import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AccountingPostingContext } from '@/infrastructure/interfaces/accounting/accounting-period'

export const getPostingContextAction = async (): Promise<ApiResult<AccountingPostingContext>> => {
  try {
    const result = await accountingApi.getPostingContext()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el contexto contable operativo.')
  }
}
