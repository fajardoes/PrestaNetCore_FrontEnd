import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

interface OpenPeriodCardProps {
  period: AccountingPeriodDto
  businessDate?: string | null
  automaticPostingAllowed?: boolean
  onClose: () => void
  isClosing?: boolean
  disableClose?: boolean
  disableCloseReason?: string
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

export const OpenPeriodCard = ({
  period,
  businessDate,
  automaticPostingAllowed,
  onClose,
  isClosing,
  disableClose = false,
  disableCloseReason,
}: OpenPeriodCardProps) => {
  const monthLabel = monthNames[period.month - 1] ?? `Mes ${period.month}`

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-200">
            Periodo operativo actual
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-sky-950 dark:text-sky-50">
              {period.periodLabel || `${monthLabel} ${period.fiscalYear}`}
            </h2>
            <span className="inline-flex items-center rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-sky-500">
              {automaticPostingAllowed ? 'Automatico activo' : 'Automatico bloqueado'}
            </span>
          </div>
          {businessDate ? (
            <p className="text-xs text-sky-800/80 dark:text-sky-200/80">
              Fecha de negocio: {new Date(`${businessDate}T00:00:00`).toLocaleDateString('es-HN')}
            </p>
          ) : null}
          {period.openedAt ? (
            <p className="text-xs text-sky-800/80 dark:text-sky-200/80">
              Abierto el {new Date(period.openedAt).toLocaleDateString()}
            </p>
          ) : null}
          {disableClose && disableCloseReason ? (
            <p className="text-xs text-amber-700 dark:text-amber-200">
              {disableCloseReason}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn-primary w-full px-5 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          onClick={onClose}
          disabled={isClosing || disableClose}
        >
          {isClosing ? 'Cerrando...' : 'Cerrar período'}
        </button>
      </div>
    </div>
  )
}

