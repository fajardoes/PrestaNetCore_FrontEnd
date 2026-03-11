import type { JournalEntryLineRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'

export interface UpdateJournalEntryRequest {
  date: string
  eventDate?: string | null
  postingMode?: string | null
  requestedPostingPeriodId?: string | null
  description: string
  costCenterId?: string | null
  lines: JournalEntryLineRequest[]
}
