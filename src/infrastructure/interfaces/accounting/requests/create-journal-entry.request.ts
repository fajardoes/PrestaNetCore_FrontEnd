export interface CreateJournalEntryRequest {
  date: string
  eventDate?: string | null
  postingMode?: string | null
  requestedPostingPeriodId?: string | null
  description: string
  costCenterId?: string | null
  lines: JournalEntryLineRequest[]
}

export interface JournalEntryLineRequest {
  accountId: string
  description?: string | null
  debit: number
  credit: number
  reference?: string | null
}
