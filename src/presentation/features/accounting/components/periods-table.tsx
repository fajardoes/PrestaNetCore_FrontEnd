import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import type { PeriodPostingOperation } from '@/core/actions/accounting/update-period-posting-settings.action'
import { getPeriodLabel } from '@/presentation/features/accounting/accounting-ui'

interface PeriodsTableProps {
  periods: AccountingPeriodDto[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClosePeriod?: (period: AccountingPeriodDto) => void
  onRowAction?: (period: AccountingPeriodDto, operation: PeriodPostingOperation) => void
  isApplyingAction?: boolean
  operationalPeriodId?: string
  automaticPostingBlocked?: boolean
  automaticPostingBlockedReason?: string
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

export const PeriodsTable = ({
  periods,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onClosePeriod,
  onRowAction,
  isApplyingAction = false,
  operationalPeriodId,
  automaticPostingBlocked = false,
  automaticPostingBlockedReason,
}: PeriodsTableProps) => {
  return (
    <TableContainer mode="legacy-compact">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Periodo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Capacidades
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Resumen
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={5}
                >
                  Cargando períodos contables...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                  colSpan={5}
                >
                  {error}
                </td>
              </tr>
            ) : !periods.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={5}
                >
                  No hay períodos para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              periods.map((period) => (
                <tr
                  key={period.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col gap-1">
                      <span>{getPeriodLabel(period)}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        {monthNames[period.month - 1] ?? `Mes ${period.month}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col items-start gap-1">
                      <AccountingStatusBadge state={period.state} />
                      {period.id === operationalPeriodId ? (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40">
                          Operativo
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        period.allowAutomaticPosting
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                          : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                      }`}>
                        Automatico {period.allowAutomaticPosting ? 'si' : 'no'}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        period.allowManualPosting
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                          : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                      }`}>
                        Manual {period.allowManualPosting ? 'si' : 'no'}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        period.allowAdjustments
                          ? 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40'
                          : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                      }`}>
                        Ajustes {period.allowAdjustments ? 'si' : 'no'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{period.postingSummary || 'Sin resumen de posteo.'}</span>
                      <span>
                        Abierto: {period.openedAt ? new Date(period.openedAt).toLocaleDateString() : '—'}
                      </span>
                      <span>
                        Cerrado: {period.closedAt ? new Date(period.closedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex flex-wrap justify-end gap-2">
                      {period.state === 'open' && onClosePeriod ? (
                        <button
                          type="button"
                          onClick={() => onClosePeriod(period)}
                          className="btn-table-action"
                          disabled={
                            isApplyingAction ||
                            (automaticPostingBlocked && period.id === operationalPeriodId)
                          }
                          title={
                            automaticPostingBlocked && period.id === operationalPeriodId
                              ? automaticPostingBlockedReason
                              : undefined
                          }
                        >
                          Cerrar
                        </button>
                      ) : null}
                      {onRowAction ? (
                        <button
                          type="button"
                          onClick={() =>
                            onRowAction(
                              period,
                              period.allowAdjustments
                                ? 'disable-adjustments'
                                : 'enable-adjustments',
                            )
                          }
                          className="btn-table-action"
                          disabled={isApplyingAction}
                        >
                          {period.allowAdjustments ? 'Quitar ajustes' : 'Habilitar ajustes'}
                        </button>
                      ) : null}
                      {onRowAction ? (
                        <button
                          type="button"
                          onClick={() =>
                            onRowAction(
                              period,
                              period.allowAutomaticPosting
                                ? 'disable-automatic-posting'
                                : 'enable-automatic-posting',
                            )
                          }
                          className="btn-table-action"
                          disabled={isApplyingAction || Boolean(period.isLocked)}
                          title={period.isLocked ? 'El periodo esta bloqueado para acciones de posteo.' : undefined}
                        >
                          {period.allowAutomaticPosting ? 'Bloquear automatico' : 'Habilitar automatico'}
                        </button>
                      ) : null}
                      {!period.isLocked && onRowAction ? (
                        <button
                          type="button"
                          onClick={() => onRowAction(period, 'lock')}
                          className="btn-table-action border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-600/60 dark:text-amber-100 dark:hover:bg-amber-500/10"
                          disabled={isApplyingAction}
                        >
                          Bloquear
                        </button>
                      ) : null}
                      {!period.state || (period.isLocked && !onClosePeriod && !onRowAction) ? (
                        <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </TableContainer>
  )
}
