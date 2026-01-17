export type JournalEntryState = 'draft' | 'posted' | 'voided'

export type JournalEntrySource = 'manual' | 'system'

export interface JournalEntryLine {
  id?: string
  accountId: string
  accountCode?: string
  accountName?: string
  description?: string | null
  debit: number
  credit: number
  reference?: string | null
}

export interface JournalEntryListItem {
  id: string
  number?: string | null
  date: string
  description: string
  state: JournalEntryState
  source: JournalEntrySource
  totalDebit: number
  totalCredit: number
  periodId?: string | null
  costCenterId?: string | null
}

export interface JournalEntryDetail extends JournalEntryListItem {
  lines: JournalEntryLine[]
  postedAt?: string | null
  voidedAt?: string | null
  periodName?: string | null
  costCenterName?: string | null
}
