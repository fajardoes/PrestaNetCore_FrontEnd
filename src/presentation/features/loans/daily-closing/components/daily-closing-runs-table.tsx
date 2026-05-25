import { Eye } from 'lucide-react'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
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
}: DailyClosingRunsTableProps) => {
  const columns = [
    {
      key: 'businessDate',
      header: 'Fecha operativa',
      className: 'min-w-[130px]',
      render: (item: DailyLoanClosingRunResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatDateOnly(item.businessDate)}
        </span>
      ),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatDateOnly(item.businessDate),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[120px]',
      render: (item: DailyLoanClosingRunResponse) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRunStatusBadgeClass(item.status)}`}
        >
          {translateRunStatus(item.status)}
        </span>
      ),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        translateRunStatus(item.status),
    },
    {
      key: 'totalLoans',
      header: 'Prestamos totales',
      render: (item: DailyLoanClosingRunResponse) => formatNumber(item.totalLoans),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.totalLoans),
    },
    {
      key: 'processedLoans',
      header: 'Procesados',
      render: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.processedLoans),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.processedLoans),
    },
    {
      key: 'failedLoans',
      header: 'Fallidos',
      render: (item: DailyLoanClosingRunResponse) => formatNumber(item.failedLoans),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.failedLoans),
    },
    {
      key: 'skippedLoans',
      header: 'Omitidos',
      render: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.skippedLoans),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.skippedLoans),
    },
    {
      key: 'journalEntries',
      header: 'Asientos',
      render: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedJournalEntries),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedJournalEntries),
    },
    {
      key: 'events',
      header: 'Eventos',
      render: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedEvents),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedEvents),
    },
    {
      key: 'snapshots',
      header: 'Snapshots',
      render: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedSnapshots),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatNumber(item.generatedSnapshots),
    },
    {
      key: 'duration',
      header: 'Duracion',
      className: 'min-w-[100px]',
      render: (item: DailyLoanClosingRunResponse) =>
        formatDuration(item.executionTimeMs),
      getTitle: (item: DailyLoanClosingRunResponse) =>
        formatDuration(item.executionTimeMs),
    },
    {
      key: 'error',
      header: 'Error',
      className: 'min-w-[220px]',
      render: (item: DailyLoanClosingRunResponse) =>
        item.errorMessage?.trim() || '-',
      getTitle: (item: DailyLoanClosingRunResponse) =>
        item.errorMessage?.trim() || '-',
    },
    {
      key: 'action',
      header: 'Accion',
      className: 'min-w-[70px]',
      render: (item: DailyLoanClosingRunResponse) => (
        <span className="flex justify-end">
          <button
            type="button"
            className="btn-table-action w-7 px-0"
            title="Ver detalle"
            aria-label="Ver detalle"
            onClick={() => onViewDetail(item)}
          >
            <Eye className="mx-auto h-3.5 w-3.5" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title="Historico de cierres diarios"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando cierres..."
        emptyMessage={error ? 'No fue posible cargar los cierres.' : 'No hay ejecuciones para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * pageSize + 1}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
