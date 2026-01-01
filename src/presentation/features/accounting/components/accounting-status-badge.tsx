import type { AccountingPeriodState } from '@/infrastructure/interfaces/accounting/accounting-period'

interface AccountingStatusBadgeProps {
  state?: AccountingPeriodState
  isActive?: boolean
}

export const AccountingStatusBadge = ({
  state,
  isActive,
}: AccountingStatusBadgeProps) => {
  if (state) {
    const palette: Record<AccountingPeriodState, string> = {
      open: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40',
      closed:
        'bg-slate-200 text-slate-800 ring-slate-300 dark:bg-slate-700/40 dark:text-slate-100 dark:ring-slate-600/60',
      locked:
        'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-50 dark:ring-amber-500/30',
    }
    const labels: Record<AccountingPeriodState, string> = {
      open: 'Abierto',
      closed: 'Cerrado',
      locked: 'Bloqueado',
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${palette[state]}`}
      >
        {labels[state]}
      </span>
    )
  }

  if (typeof isActive === 'boolean') {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
          isActive
            ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
            : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
        }`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  return null
}
