import type { JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'
import { JournalEntryStateBadge } from './journal-entry-state-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'

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
  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan={8}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            Cargando asientos...
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={8}
            className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
          >
            {error}
          </td>
        </tr>
      )
    }

    if (!items.length) {
      return (
        <tr>
          <td
            colSpan={8}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            No hay asientos para los filtros seleccionados.
          </td>
        </tr>
      )
    }

    return items.map((entry) => (
      <tr
        key={entry.id}
        className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
      >
        <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {entry.number || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.date}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.description}
        </td>
        <td className="px-4 py-3 text-sm">
          <JournalEntryStateBadge state={entry.state} />
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.source === 'manual' ? 'Manual' : 'Sistema'}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(entry.totalDebit)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(entry.totalCredit)}
        </td>
        <td className="px-4 py-3 text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onView(entry)}
              className="btn-icon-label"
            >
              Ver
            </button>
            {entry.state === 'draft' ? (
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="btn-icon-label"
              >
                Editar
              </button>
            ) : null}
            {entry.state === 'draft' ? (
              <button
                type="button"
                onClick={() => onPost(entry)}
                className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-600/50 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
              >
                Postear
              </button>
            ) : null}
            {entry.state === 'posted' ? (
              <button
                type="button"
                onClick={() => onVoid(entry)}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-600/60 dark:text-red-200 dark:hover:bg-red-500/10"
              >
                Anular
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    ))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Número
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Tipo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Debe
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Haber
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {renderContent()}
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
