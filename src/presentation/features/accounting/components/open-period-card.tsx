import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

interface OpenPeriodCardProps {
  period: AccountingPeriodDto
  onClose: () => void
  isClosing?: boolean
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const OpenPeriodCard = ({ period, onClose, isClosing }: OpenPeriodCardProps) => {
  const monthLabel = monthNames[period.month - 1] ?? `Mes ${period.month}`

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
            Current Open Period
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              {monthLabel} {period.fiscalYear}
            </h2>
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-emerald-500">
              OPEN
            </span>
          </div>
          {period.openedAt ? (
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
              Abierto el {new Date(period.openedAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn-primary w-full px-5 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          onClick={onClose}
          disabled={isClosing}
        >
          {isClosing ? 'Cerrando...' : 'Cerrar período'}
        </button>
      </div>
    </div>
  )
}

