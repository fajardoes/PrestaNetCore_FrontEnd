export interface LedgerEntry {
  date: string
  journalId: string
  journalNumber?: string | null
  description: string
  debit: number
  credit: number
  balance: number
}

export interface LedgerResponse {
  items: LedgerEntry[]
  openingBalance?: number
}
