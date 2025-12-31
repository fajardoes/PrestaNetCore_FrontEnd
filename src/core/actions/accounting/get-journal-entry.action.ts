import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'

export const getJournalEntryAction = async (
  id: string,
): Promise<ApiResult<JournalEntryDetail>> => {
  try {
    const result = await accountingApi.getJournalEntryById(id)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el asiento contable.')
  }
}
