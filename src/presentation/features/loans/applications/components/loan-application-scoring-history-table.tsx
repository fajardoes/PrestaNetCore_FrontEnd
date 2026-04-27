import { useEffect, useMemo, useState } from 'react'
import {
  formatLoanApplicationScore,
  formatLoanApplicationScoringDateTime,
  resolveLoanApplicationScoringVariantClasses,
} from '@/core/helpers/loan-application-scoring-ui'
import type { LoanApplicationCreditScoreHistoryItemResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-history-item.response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface LoanApplicationScoringHistoryTableProps {
  items: LoanApplicationCreditScoreHistoryItemResponse[]
  isLoading?: boolean
  error?: string | null
}

const PAGE_SIZE = 5

export const LoanApplicationScoringHistoryTable = ({
  items,
  isLoading = false,
  error = null,
}: LoanApplicationScoringHistoryTableProps) => {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [currentPage, items])

  return (
    <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Historial de scorings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Evaluaciones registradas para la solicitud.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <TableContainer mode="legacy-compact" variant="strong">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-slate-700 dark:text-slate-200">
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Score</th>
              <th>Riesgo</th>
              <th>Recomendación</th>
              <th>Versión</th>
              <th>Vigente</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7}>
                    <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                  </td>
                </tr>
              ))
            ) : pagedItems.length ? (
              pagedItems.map((item) => (
                <tr key={item.id} className="text-slate-700 dark:text-slate-200">
                  <td>{formatLoanApplicationScoringDateTime(item.generatedAt)}</td>
                  <td>{item.generatedBy || '—'}</td>
                  <td className="font-semibold">{formatLoanApplicationScore(item.scoreValue)}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${resolveLoanApplicationScoringVariantClasses(
                        item.riskLevelCode === 'LOW'
                          ? 'success'
                          : item.riskLevelCode === 'MEDIUM'
                            ? 'warning'
                            : item.riskLevelCode
                              ? 'danger'
                              : 'neutral',
                      )}`}
                    >
                      {item.riskLevelName}
                    </span>
                  </td>
                  <td>{item.recommendationName}</td>
                  <td>v{item.scoreVersion}</td>
                  <td>{item.isCurrent ? 'Sí' : 'No'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No hay generaciones registradas en el historial.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Página"
        />
      </TableContainer>
    </section>
  )
}
