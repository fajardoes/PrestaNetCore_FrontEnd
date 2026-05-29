import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import {
  formatDateOnly,
  formatNumber,
  getRunStatusBadgeClass,
  translateRunStatus,
} from './daily-closing-ui'

interface DailyClosingStatusCardsProps {
  status: DailyLoanClosingStatusResponse | null
  isLoading?: boolean
}

export const DailyClosingStatusCards = ({
  status,
  isLoading,
}: DailyClosingStatusCardsProps) => {
  const cards = [
    {
      label: 'Fecha operativa',
      value: status ? formatDateOnly(status.businessDate) : '-',
      hint: 'Fecha vigente del sistema',
    },
    {
      label: 'Estado del dia',
      value: status ? (status.isDayOpen ? 'Dia abierto' : 'Dia cerrado') : '-',
      hint: status?.isDayOpen ? 'Permite operar cierre' : 'Ejecucion bloqueada',
    },
    {
      label: 'Periodo contable',
      value: status?.postingContextStatus?.trim() || '-',
      hint:
        status?.postingContextStatus === 'OK'
          ? 'Posteo automatico disponible'
          : 'Requiere revision contable',
    },
    {
      label: 'Run actual',
      value: translateRunStatus(status?.currentRunStatus),
      hint: status?.currentRunId ? status.currentRunId : 'Sin run en ejecucion',
      badgeClass: getRunStatusBadgeClass(status?.currentRunStatus),
    },
    {
      label: 'Cierre en ejecucion',
      value: status ? (status.hasRunningRun ? 'Si' : 'No') : '-',
      hint: status?.hasRunningRun
        ? 'Bloquea cierre, reproceso y simulacion'
        : 'Sin bloqueo por ejecucion activa',
    },
    {
      label: 'Cierre completado',
      value: status ? (status.hasCompletedRunForBusinessDate ? 'Si' : 'No') : '-',
      hint: status?.hasCompletedRunForBusinessDate
        ? 'Disponible solo con reproceso'
        : 'Disponible para cierre normal',
    },
    {
      label: 'Pagos REGISTERED pendientes',
      value: formatNumber(status?.pendingRegisteredPayments),
      hint: 'Advertencia informativa; no se efectivizan desde este cierre',
    },
    {
      label: 'Prestamos activos',
      value: formatNumber(status?.activeLoans),
      hint: 'Cartera candidata del dia',
    },
    {
      label: 'Prestamos vencidos estimados',
      value: formatNumber(status?.overdueLoansEstimate),
      hint: 'Estimacion operativa de mora',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <div className="mt-2 min-h-8">
            {card.badgeClass ? (
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${card.badgeClass}`}
              >
                {isLoading ? 'Cargando...' : card.value}
              </span>
            ) : (
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {isLoading ? 'Cargando...' : card.value}
              </p>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {card.hint}
          </p>
        </div>
      ))}
    </div>
  )
}
