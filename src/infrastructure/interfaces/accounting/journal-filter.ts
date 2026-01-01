import type { JournalEntrySource, JournalEntryState } from '@/infrastructure/interfaces/accounting/journal-entry'

export interface JournalFilter {
  page: number
  pageSize: number
  fromDate?: string
  toDate?: string
  periodId?: string
  state?: JournalEntryState
  costCenterId?: string
  source?: JournalEntrySource
  search?: string
}
