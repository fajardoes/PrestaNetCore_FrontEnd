import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LedgerResponse } from '@/infrastructure/interfaces/accounting/ledger-entry'

interface GetLedgerParams {
  accountId: string
  fromDate?: string
  toDate?: string
  costCenterId?: string
  includeOpeningBalance?: boolean
}

export const getLedgerAction = async (
  params: GetLedgerParams,
): Promise<ApiResult<LedgerResponse>> => {
  try {
    const result = await accountingApi.getLedger(params)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el libro mayor.')
  }
}
