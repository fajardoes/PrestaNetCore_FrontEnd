export type JournalEntryState = 'draft' | 'posted' | 'voided'

export type JournalEntrySource = 'manual' | 'system'

export type JournalPostingMode =
  | 'AUTOMATIC_OPERATION'
  | 'MANUAL_REGULAR'
  | 'MANUAL_ADJUSTMENT'
  | 'SYSTEM_ACCRUAL'
  | 'SYSTEM_RECLASS'
  | 'SYSTEM_REVERSAL'

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
  date?: string
  accountingDate?: string | null
  eventDate?: string | null
  businessDateSnapshot?: string | null
  description: string
  state: JournalEntryState
  source: JournalEntrySource
  postingMode?: JournalPostingMode | null
  postingPeriodId?: string | null
  postingPeriodName?: string | null
  totalDebit: number
  totalCredit: number
  periodId?: string | null
  periodName?: string | null
  costCenterId?: string | null
}

export interface JournalEntryDetail extends JournalEntryListItem {
  lines: JournalEntryLine[]
  postedAt?: string | null
  voidedAt?: string | null
  costCenterName?: string | null
}
