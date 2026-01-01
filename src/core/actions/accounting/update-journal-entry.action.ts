import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { UpdateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/update-journal-entry.request'

export const updateJournalEntryAction = async (
  id: string,
  payload: UpdateJournalEntryRequest,
): Promise<ApiResult<JournalEntryDetail>> => {
  try {
    const result = await accountingApi.updateJournalEntry(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el asiento contable.')
  }
}
