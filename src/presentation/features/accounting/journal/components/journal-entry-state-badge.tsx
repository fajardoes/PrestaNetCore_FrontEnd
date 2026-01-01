import type { JournalEntryState } from '@/infrastructure/interfaces/accounting/journal-entry'

interface JournalEntryStateBadgeProps {
  state: JournalEntryState
}

export const JournalEntryStateBadge = ({ state }: JournalEntryStateBadgeProps) => {
  const palette: Record<JournalEntryState, string> = {
    draft:
      'bg-slate-200 text-slate-800 ring-slate-300 dark:bg-slate-700/40 dark:text-slate-100 dark:ring-slate-600/60',
    posted:
      'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40',
    voided:
      'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40',
  }

  const label: Record<JournalEntryState, string> = {
    draft: 'Borrador',
    posted: 'Contabilizado',
    voided: 'Anulado',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${palette[state]}`}
    >
      {label[state]}
    </span>
  )
}
