import { Link } from 'react-router-dom'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import {
  formatDateOnly,
  formatDuration,
  formatNumber,
  getRunStatusBadgeClass,
  translateRunStatus,
} from './daily-closing-ui'

interface DailyClosingRunResultSummaryProps {
  result: DailyLoanClosingRunResponse | null
}

export const DailyClosingRunResultSummary = ({
  result,
}: DailyClosingRunResultSummaryProps) => {
  if (!result) return null

  const metrics = [
    ['Prestamos totales', formatNumber(result.totalLoans)],
    ['Procesados', formatNumber(result.processedLoans)],
    ['Fallidos', formatNumber(result.failedLoans)],
    ['Omitidos', formatNumber(result.skippedLoans)],
    ['Asientos', formatNumber(result.generatedJournalEntries)],
    ['Eventos', formatNumber(result.generatedEvents)],
    ['Snapshots', formatNumber(result.generatedSnapshots)],
    ['Duracion', formatDuration(result.executionTimeMs)],
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Resultado de ejecucion
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Fecha operativa {formatDateOnly(result.businessDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRunStatusBadgeClass(result.status)}`}
          >
            {translateRunStatus(result.status)}
          </span>
          <Link
            to={`/loans/daily-closing/runs/${result.id}`}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Ver detalle
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {value}
            </p>
          </div>
        ))}
      </div>

      {result.errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {result.errorMessage}
        </div>
      ) : null}
    </div>
  )
}
