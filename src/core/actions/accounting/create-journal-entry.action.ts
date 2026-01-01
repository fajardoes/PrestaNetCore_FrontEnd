import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { CreateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'

export const createJournalEntryAction = async (
  payload: CreateJournalEntryRequest,
): Promise<ApiResult<JournalEntryDetail>> => {
  try {
    const result = await accountingApi.createJournalEntry(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el asiento contable.')
  }
}
