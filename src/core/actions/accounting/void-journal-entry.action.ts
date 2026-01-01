import { accountingApi } from '@/core/api/accounting-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { VoidJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/void-journal-entry.request'

export const voidJournalEntryAction = async (
  id: string,
  payload: VoidJournalEntryRequest,
): Promise<ApiResult<JournalEntryDetail>> => {
  try {
    const result = await accountingApi.voidJournalEntry(id, payload)
    return { success: true, data: result }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 409) {
      return toApiError(
        error,
        'No se puede contabilizar el asiento porque el período contable está cerrado o bloqueado.',
      )
    }
    return toApiError(error, 'No fue posible anular el asiento contable.')
  }
}

const getAxiosStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  ) {
    return (error as { response?: { status?: number } }).response?.status
  }
  return undefined
}
