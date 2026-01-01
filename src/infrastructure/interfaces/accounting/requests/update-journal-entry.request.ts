import type { JournalEntryLineRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'

export interface UpdateJournalEntryRequest {
  date: string
  description: string
  costCenterId?: string | null
  lines: JournalEntryLineRequest[]
}
