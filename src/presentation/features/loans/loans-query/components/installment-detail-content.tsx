import type { ReactNode } from 'react'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'
import {
  formatCurrency,
  formatDate,
  formatFinancialComponentCode,
  formatMoney,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { QueryMetricCard } from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { TableContainer } from '@/presentation/share/components/table-container'

interface InstallmentDetailContentProps {
  installment: LoanInstallmentDetailResponse | null
  isLoading: boolean
  error: string | null
}

export const InstallmentDetailContent = ({
  installment,
  isLoading,
  error,
}: InstallmentDetailContentProps) => {
  if (isLoading) {
    return <InstallmentDetailSkeleton />
  }

  if (error || !installment) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error ?? 'No se encontró la cuota.'}
      </div>
    )
  }

  const paidRatio =
    installment.totalProjected > 0 ? (installment.totalPaid / installment.totalProjected) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <QueryMetricCard
          label="Total"
          value={formatCurrency(installment.totalProjected)}
          accent="blue"
        />
        <QueryMetricCard
          label="Pagado"
          value={formatCurrency(installment.totalPaid)}
          accent="sky"
        />
        <QueryMetricCard
          label="Saldo"
          value={formatCurrency(installment.totalProjected - installment.totalPaid)}
          accent="amber"
        />
        <QueryMetricCard
          label="Cobertura"
          value={`${formatMoney(paidRatio)}%`}
          accent="slate"
        />
      </div>

      <section className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Datos operativos
        </h3>
        <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <InstallmentInfo label="Fecha original" value={formatDate(installment.dueDateOriginal)} />
          <InstallmentInfo label="Fecha ajustada" value={formatDate(installment.dueDateAdjusted)} />
          <InstallmentInfo
            label="Estado"
            value={
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(installment.statusCode)}`}
              >
                {translateLoanApplicationStatus(installment.statusCode, installment.statusName)}
              </span>
            }
          />
        </dl>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Componentes
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Desglose proyectado, pagado y pendiente de la cuota.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {installment.components.length} registro(s)
          </span>
        </div>

        <TableContainer mode="legacy-compact" variant="strong">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Componente</th>
                  <th className="text-right">Proyectado</th>
                  <th className="text-right">Pagado</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {!installment.components.length ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-center text-slate-500 dark:text-slate-400">
                      No hay componentes para esta cuota.
                    </td>
                  </tr>
                ) : (
                  installment.components.map((component) => (
                    <tr key={component.id}>
                      <td>
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {formatFinancialComponentCode(
                            component.financialComponentCode,
                            component.financialComponentName,
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-right">{formatCurrency(component.amountProjected)}</td>
                      <td className="whitespace-nowrap text-right">{formatCurrency(component.amountPaid)}</td>
                      <td className="whitespace-nowrap text-right">
                        {formatCurrency(component.amountProjected - component.amountPaid)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </section>
    </div>
  )
}

const InstallmentInfo = ({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) => (
  <div>
    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</dd>
  </div>
)

const InstallmentDetailSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Cargando detalle de cuota">
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-[76px] animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        />
      ))}
    </div>
    <div className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    <div className="space-y-2">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-36 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    </div>
  </div>
)
