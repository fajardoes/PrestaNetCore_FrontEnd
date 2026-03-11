import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLoan } from '@/presentation/features/loans/loans-query/hooks/use-loan'
import { useLoanInstallments } from '@/presentation/features/loans/loans-query/hooks/use-loan-installments'
import { DisbursementChargesTable } from '@/presentation/features/loans/components/disbursement-charges-table'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { RecognitionPolicyBadges } from '@/presentation/features/loans/components/recognition-policy-badges'
import { TableContainer } from '@/presentation/share/components/table-container'
import {
  formatCurrency,
  formatMoney,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

export const LoanDetailPage = () => {
  const { id = '' } = useParams()
  const { loan, isLoading: isLoadingLoan, error: loanError, loadLoan } = useLoan()
  const {
    installments,
    isLoading: isLoadingInstallments,
    error: installmentsError,
    loadInstallments,
  } = useLoanInstallments()

  useEffect(() => {
    if (!id) return
    void Promise.all([loadLoan(id), loadInstallments(id)])
  }, [id, loadInstallments, loadLoan])

  if (isLoadingLoan) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando préstamo...</p>
  }

  if (loanError || !loan) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {loanError ?? 'No se encontró el préstamo.'}
      </div>
    )
  }

  const loanLabel = loan.loanNo?.trim() || loan.id

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{loanLabel}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">ID: {loan.id}</p>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <Meta label="No. de préstamo" value={loan.loanNo?.trim() || '—'} />
          <Meta label="Estado" value={loan.statusName} />
          <Meta label="Principal" value={formatCurrency(loan.principal)} />
          <Meta label="Plazo" value={String(loan.term)} />
          <Meta label="Frecuencia" value={loan.paymentFrequencyName} />
          <Meta label="Tasa nominal" value={formatRateAsPercent(loan.nominalRate)} />
          <Meta label="Vence" value={loan.maturityDate ?? '—'} />
        </div>
      </section>

      <DisbursementSummaryCard data={loan} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Políticas informativas
        </h2>
        <div className="mt-3">
          <RecognitionPolicyBadges
            interestPolicyCode={loan.interestRecognitionPolicyCode}
            feePolicyCode={loan.feeRecognitionPolicyCode}
          />
        </div>
      </section>

      <DisbursementChargesTable charges={loan.disbursementCharges} />

      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Vence original</th>
                <th>Vence ajustada</th>
                <th className="text-right">Principal</th>
                <th className="text-right">Interés</th>
                <th className="text-right">Total</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingInstallments ? (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    Cargando cuotas...
                  </td>
                </tr>
              ) : installmentsError ? (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                    {installmentsError}
                  </td>
                </tr>
              ) : !installments.length ? (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    Este préstamo no tiene cuotas registradas.
                  </td>
                </tr>
              ) : (
                installments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.installmentNo}</td>
                    <td>{item.dueDateOriginal}</td>
                    <td>{item.dueDateAdjusted}</td>
                    <td className="text-right">{formatMoney(item.principalProjected)}</td>
                    <td className="text-right">{formatMoney(item.interestProjected)}</td>
                    <td className="text-right">{formatMoney(item.totalProjected)}</td>
                    <td>{item.statusName}</td>
                    <td className="text-right">
                      <Link
                        to={`/loans/${loan.id}/installments/${item.installmentNo}`}
                        className="btn-table-action inline-flex px-2"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>
    </div>
  )
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
