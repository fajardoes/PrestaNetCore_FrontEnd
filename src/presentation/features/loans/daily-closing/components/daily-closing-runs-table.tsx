import { Eye } from 'lucide-react'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import {
  formatDateOnly,
  formatDuration,
  formatNumber,
  getRunStatusBadgeClass,
  translateRunStatus,
} from './daily-closing-ui'

interface DailyClosingRunsTableProps {
  items: DailyLoanClosingRunResponse[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onViewDetail: (run: DailyLoanClosingRunResponse) => void
}

export const DailyClosingRunsTable = ({
  items,
  isLoading,
  error,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}: DailyClosingRunsTableProps) => (
  <TableContainer mode="legacy-compact" variant="strong">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {[
              'Fecha operativa',
              'Estado',
              'Prestamos totales',
              'Procesados',
              'Fallidos',
              'Omitidos',
              'Asientos',
              'Eventos',
              'Snapshots',
              'Duracion',
              'Error',
            ].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                {label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Accion
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {isLoading ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Cargando cierres...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                {error}
              </td>
            </tr>
          ) : !items.length ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No hay runs para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDateOnly(item.businessDate)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRunStatusBadgeClass(item.status)}`}
                  >
                    {translateRunStatus(item.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.totalLoans)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.processedLoans)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.failedLoans)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.skippedLoans)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.generatedJournalEntries)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.generatedEvents)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.generatedSnapshots)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatDuration(item.executionTimeMs)}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.errorMessage?.trim() || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="btn-table-action w-7 px-0"
                    title="Ver detalle"
                    onClick={() => onViewDetail(item)}
                  >
                    <Eye className="mx-auto h-3.5 w-3.5" />
                  </button>
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
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  </TableContainer>
)
