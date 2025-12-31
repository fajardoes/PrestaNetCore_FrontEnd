import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { JournalFilter } from '@/infrastructure/interfaces/accounting/journal-filter'
import type { PagedResponse } from '@/infrastructure/interfaces/accounting/paged-response'

export const listJournalEntriesAction = async (
  filters: JournalFilter,
): Promise<ApiResult<PagedResponse<JournalEntryListItem>>> => {
  try {
    const result = await accountingApi.getJournalEntries(filters)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los asientos del diario.')
  }
}
