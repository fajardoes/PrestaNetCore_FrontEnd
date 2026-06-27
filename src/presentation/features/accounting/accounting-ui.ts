import type {
  AccountingPeriodDto,
  AccountingPostingContext,
} from '@/infrastructure/interfaces/accounting/accounting-period'
import type {
  JournalEntryDetail,
  JournalEntryListItem,
  JournalPostingMode,
} from '@/infrastructure/interfaces/accounting/journal-entry'

export const formatAccountingDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-HN')
}

export const getJournalAccountingDate = (
  entry: JournalEntryListItem | JournalEntryDetail,
) => entry.accountingDate ?? entry.date ?? ''

export const getPostingModeLabel = (mode?: JournalPostingMode | null) => {
  const labels: Record<JournalPostingMode, string> = {
    AUTOMATIC_OPERATION: 'Operacion automatica',
    MANUAL_REGULAR: 'Asiento manual regular',
    MANUAL_ADJUSTMENT: 'Ajuste manual',
    SYSTEM_ACCRUAL: 'Devengo automatico',
    SYSTEM_RECLASS: 'Reclasificacion automatica',
    SYSTEM_REVERSAL: 'Reversa del sistema',
  }

  if (!mode) return '—'
  return labels[mode] ?? mode
}

export const getPeriodLabel = (period?: AccountingPeriodDto | null) => {
  if (!period) return '—'
  if (period.periodLabel?.trim()) return period.periodLabel
  return `${period.fiscalYear}-${String(period.month).padStart(2, '0')}`
}

export const doesDateBelongToPeriod = (dateValue: string, period?: AccountingPeriodDto | null) => {
  if (!dateValue || !period) return false
  const [year, month] = dateValue.split('-').map(Number)
  return year === period.fiscalYear && month === period.month
}

export const getPostingContextMessages = (context?: AccountingPostingContext | null) => {
  if (!context) return []
  return Array.from(
    new Set([...context.warnings, ...context.validationMessages].filter(Boolean)),
  )
}
