import type { JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'
import { JournalEntryStateBadge } from './journal-entry-state-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import {
  formatAccountingDate,
  getJournalAccountingDate,
  getPostingModeLabel,
} from '@/presentation/features/accounting/accounting-ui'

interface JournalTableProps {
  items: JournalEntryListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (entry: JournalEntryListItem) => void
  onEdit: (entry: JournalEntryListItem) => void
  onPost: (entry: JournalEntryListItem) => void
  onVoid: (entry: JournalEntryListItem) => void
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const JOURNAL_PAGE_SIZE = 10

export const JournalTable = ({
  items,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onPost,
  onVoid,
}: JournalTableProps) => {
  const columns = [
    {
      key: 'number',
      header: 'Número',
      className: 'min-w-[105px]',
      render: (entry: JournalEntryListItem) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {entry.number || '—'}
        </span>
      ),
      getTitle: (entry: JournalEntryListItem) => entry.number || '—',
    },
    {
      key: 'date',
      header: 'Fecha',
      className: 'min-w-[135px]',
      render: (entry: JournalEntryListItem) => (
        <span className="flex flex-col gap-1">
          <span>{formatAccountingDate(getJournalAccountingDate(entry))}</span>
          {entry.eventDate ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Evento: {formatAccountingDate(entry.eventDate)}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      className: 'w-[245px] min-w-[245px]',
      render: (entry: JournalEntryListItem) => (
        <span className="block w-[225px] whitespace-normal break-words">
          {entry.description}
        </span>
      ),
      getTitle: (entry: JournalEntryListItem) => entry.description,
    },
    {
      key: 'state',
      header: 'Estado',
      className: 'min-w-[130px]',
      render: (entry: JournalEntryListItem) => (
        <span className="flex flex-col items-start gap-1">
          <JournalEntryStateBadge state={entry.state} />
          {entry.state !== 'posted' && entry.totalDebit !== entry.totalCredit ? (
            <span className="text-[11px] font-semibold leading-4 text-amber-700 dark:text-amber-300">
              • Desbalanceado
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'min-w-[180px]',
      render: (entry: JournalEntryListItem) => (
        <span className="flex flex-col gap-1">
          <span>{entry.source === 'manual' ? 'Manual' : 'Sistema'}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {getPostingModeLabel(entry.postingMode)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {entry.postingPeriodName || entry.periodName || 'Periodo no definido'}
          </span>
        </span>
      ),
    },
    {
      key: 'debit',
      header: 'Debe',
      className: 'min-w-[105px] text-right',
      render: (entry: JournalEntryListItem) => formatAmount(entry.totalDebit),
      getTitle: (entry: JournalEntryListItem) => formatAmount(entry.totalDebit),
    },
    {
      key: 'credit',
      header: 'Haber',
      className: 'min-w-[105px] text-right',
      render: (entry: JournalEntryListItem) => formatAmount(entry.totalCredit),
      getTitle: (entry: JournalEntryListItem) => formatAmount(entry.totalCredit),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[225px]',
      render: (entry: JournalEntryListItem) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(entry)}
            className="btn-table-action"
          >
            Ver
          </button>
          {entry.state === 'draft' ? (
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="btn-table-action"
            >
              Editar
            </button>
          ) : null}
          {entry.state === 'draft' ? (
            <button
              type="button"
              onClick={() => onPost(entry)}
              className="btn-table-action border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-600/50 dark:text-sky-200 dark:hover:bg-sky-500/10"
            >
              Postear
            </button>
          ) : null}
          {entry.state === 'posted' && entry.source === 'manual' ? (
            <button
              type="button"
              onClick={() => onVoid(entry)}
              className="btn-table-action border-red-200 text-red-700 hover:bg-red-50 dark:border-red-600/60 dark:text-red-200 dark:hover:bg-red-500/10"
            >
              Anular
            </button>
          ) : null}
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
        title="Asientos contables"
        columns={columns}
        rows={items}
        rowKey={(entry) => entry.id}
        isLoading={isLoading}
        loadingMessage="Cargando asientos..."
        emptyMessage={error ? 'No fue posible cargar los asientos.' : 'No hay asientos para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * JOURNAL_PAGE_SIZE + 1}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
