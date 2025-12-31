export interface CreateJournalEntryRequest {
  date: string
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
