import type { IncomeStatementResultDto } from '@/infrastructure/accounting/dtos/reports/income-statement-result.dto'

interface IncomeStatementSummaryProps {
  data: IncomeStatementResultDto | null
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

export const IncomeStatementSummary = ({
  data,
  isLoading,
  error,
}: IncomeStatementSummaryProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando estado de resultados...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Aplica filtros para consultar el estado de resultados.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total ingresos
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {formatAmount(data.totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total gastos
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {formatAmount(data.totalExpenses)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Resultado neto
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {formatAmount(data.netResult)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.groups.map((group) => (
          <div
            key={group.groupKey}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {group.groupName}
              </h3>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {formatAmount(group.total)}
              </span>
            </div>
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
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {group.accounts.map((account) => (
                    <tr
                      key={account.accountId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {account.accountCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {account.accountName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                        {formatAmount(account.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-900">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200"> </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-100">
                      {formatAmount(group.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
