import type { TrialBalanceResultDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-result.dto'

interface TrialBalanceTableProps {
  data: TrialBalanceResultDto | null
  isLoading: boolean
  error: string | null
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const TrialBalanceTable = ({
  data,
  isLoading,
  error,
}: TrialBalanceTableProps) => {
  const rows = data?.rows ?? []

  const renderRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            Cargando balance de comprobacion...
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

    if (!rows.length) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            No hay datos para el filtro seleccionado.
          </td>
        </tr>
      )
    }

    return rows.map((row) => (
      <tr
        key={`${row.accountId}-${row.level}`}
        className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
      >
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {row.accountCode}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          {row.accountName}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(row.openingBalance)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(row.debit)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(row.credit)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
          {formatAmount(row.closingBalance)}
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
                Codigo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Cuenta
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Saldo inicial
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Debitos
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Creditos
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Saldo final
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {renderRows()}
            {data && rows.length ? (
              <tr className="bg-slate-50 dark:bg-slate-900">
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Totales
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200"> </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {formatAmount(data.totalOpeningBalance)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {formatAmount(data.totalDebit)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {formatAmount(data.totalCredit)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {formatAmount(data.totalClosingBalance)}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
