import type { DailyLoanClosingRunDetailResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import {
  formatAmount,
  formatDateTime,
  formatNumber,
  getProcessingStatusBadgeClass,
  translateProcessCode,
  translateProcessingStatus,
} from './daily-closing-ui'

interface DailyClosingRunDetailsTableProps {
  items: DailyLoanClosingRunDetailResponse[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const DailyClosingRunDetailsTable = ({
  items,
  isLoading,
  error,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DailyClosingRunDetailsTableProps) => (
  <TableContainer mode="legacy-compact" variant="strong">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {[
              'Estado',
              'Proceso',
              'Prestamo',
              'Inicio',
              'Fin',
              'Eventos',
              'Asientos',
              'Monto generado',
              'Error',
            ].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {isLoading ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Cargando detalles...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                {error}
              </td>
            </tr>
          ) : !items.length ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No hay detalles para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={
                  item.processingStatus === 'FAILED'
                    ? 'bg-red-50/70 dark:bg-red-500/10'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-900'
                }
              >
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getProcessingStatusBadgeClass(item.processingStatus)}`}
                  >
                    {translateProcessingStatus(item.processingStatus)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {translateProcessCode(item.processCode)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.loanNo?.trim() || 'Proceso global'}
                  {item.loanId && !item.loanNo ? (
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      {item.loanId}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatDateTime(item.startedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatDateTime(item.completedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.generatedEvents)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatNumber(item.generatedJournalEntries)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatAmount(item.generatedAmount)}
                </td>
                <td className="max-w-sm px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className="line-clamp-2">{item.errorMessage?.trim() || '-'}</span>
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
