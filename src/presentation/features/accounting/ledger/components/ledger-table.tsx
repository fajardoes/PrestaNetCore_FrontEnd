import type { LedgerEntry } from '@/infrastructure/interfaces/accounting/ledger-entry'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LedgerTableProps {
  entries: LedgerEntry[]
  openingBalance?: number
  isLoading: boolean
  error: string | null
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const LedgerTable = ({
  entries,
  openingBalance,
  isLoading,
  error,
}: LedgerTableProps) => {
  const renderRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            Cargando movimientos...
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
          >
            {error}
          </td>
        </tr>
      )
    }

    if (!entries.length) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            No hay movimientos para el rango seleccionado.
          </td>
        </tr>
      )
    }

    return entries.map((entry, index) => (
      <tr
        key={`${entry.journalId}-${entry.date}-${index}`}
        className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
      >
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.date}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.journalNumber || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {entry.description}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(entry.debit)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(entry.credit)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(entry.balance)}
        </td>
      </tr>
    ))
  }

  return (
    <TableContainer mode="legacy-compact">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Asiento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Descripción
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Debe
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Haber
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {typeof openingBalance === 'number' ? (
              <tr className="bg-emerald-50/50 dark:bg-emerald-500/10">
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  —
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Saldo inicial
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  —
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                  —
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                  —
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatAmount(openingBalance)}
                </td>
              </tr>
            ) : null}
            {renderRows()}
          </tbody>
        </table>
      </div>
    </TableContainer>
  )
}
