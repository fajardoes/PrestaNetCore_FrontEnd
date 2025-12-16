import type { AccountingPeriod } from '@/infrastructure/interfaces/accounting/accounting-period'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface PeriodsTableProps {
  periods: AccountingPeriod[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClosePeriod?: (period: AccountingPeriod) => void
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
}: PeriodsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Año
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Mes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Apertura / Cierre
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
                    {period.fiscalYear}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {monthNames[period.month - 1] ?? `Mes ${period.month}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <AccountingStatusBadge state={period.state} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Abierto: {period.openedAt ? new Date(period.openedAt).toLocaleDateString() : '—'}
                      </span>
                      <span>
                        Cerrado: {period.closedAt ? new Date(period.closedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {period.state === 'open' && onClosePeriod ? (
                      <button
                        type="button"
                        onClick={() => onClosePeriod(period)}
                        className="btn-icon-label"
                      >
                        Cerrar
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        —
                      </span>
                    )}
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
    </div>
  )
}
