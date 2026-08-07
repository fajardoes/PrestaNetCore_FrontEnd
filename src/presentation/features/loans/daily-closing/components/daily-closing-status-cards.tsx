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
      label: 'Pagos registrados pendientes',
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
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <div className="mt-1 min-h-7">
            {card.badgeClass ? (
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${card.badgeClass}`}
              >
                {isLoading ? 'Cargando...' : card.value}
              </span>
            ) : (
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isLoading ? 'Cargando...' : card.value}
              </p>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
            {card.hint}
          </p>
        </div>
      ))}
    </div>
  )
}
