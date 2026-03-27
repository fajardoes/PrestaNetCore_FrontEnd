import { Coins, ReceiptText, Scale, Wallet } from 'lucide-react'
import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  QueryDetailField,
  QueryHeroCard,
  QueryMetricCard,
  QuerySectionCard,
} from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { useLoanInstallment } from '@/presentation/features/loans/loans-query/hooks/use-loan-installment'
import {
  formatDate,
  formatFinancialComponentCode,
  formatMoney,
  getInstallmentComponentAmount,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { TableContainer } from '@/presentation/share/components/table-container'

export const LoanInstallmentDetailPage = () => {
  const { id = '', installmentNo = '' } = useParams()
  const installmentNumber = Number.parseInt(installmentNo, 10)
  const { installment, isLoading, error, loadInstallment } = useLoanInstallment()

  useEffect(() => {
    if (!id || Number.isNaN(installmentNumber)) return
    void loadInstallment(id, installmentNumber)
  }, [id, installmentNumber, loadInstallment])

  const componentSummary = useMemo(() => {
    if (!installment) {
      return {
        projected: 0,
        paid: 0,
      }
    }

    return installment.components.reduce(
      (accumulator, component) => ({
        projected: accumulator.projected + component.amountProjected,
        paid: accumulator.paid + component.amountPaid,
      }),
      { projected: 0, paid: 0 },
    )
  }, [installment])

  if (isLoading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando cuota...</p>
  }

  if (error || !installment) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error ?? 'No se encontró la cuota.'}
      </div>
    )
  }

  const paidRatio =
    installment.totalProjected > 0 ? (installment.totalPaid / installment.totalProjected) * 100 : 0

  return (
    <div className="space-y-6">
      <QueryHeroCard
        eyebrow="Detalle de cuota"
        title={`Cuota #${installment.installmentNo}`}
        description="Consulta la estructura financiera de la cuota, sus componentes y el avance de pago registrado."
        badge={
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(installment.statusCode)}`}
          >
            {translateLoanApplicationStatus(installment.statusCode, installment.statusName)}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary px-4 py-2 text-sm" to={`/loans/${id}`}>
              Volver al préstamo
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <QueryMetricCard
            label="Total proyectado"
            value={`L ${formatMoney(installment.totalProjected)}`}
            hint={`Préstamo: ${installment.loanId}`}
            accent="blue"
          />
          <QueryMetricCard
            label="Total pagado"
            value={`L ${formatMoney(installment.totalPaid)}`}
            hint={`Avance ${formatMoney(paidRatio)}%`}
            accent="emerald"
          />
          <QueryMetricCard
            label="Fecha ajustada"
            value={formatDate(installment.dueDateAdjusted)}
            hint={`Original: ${formatDate(installment.dueDateOriginal)}`}
            accent="amber"
          />
          <QueryMetricCard
            label="Componentes"
            value={String(installment.components.length)}
            hint="Desglose financiero de la cuota"
            accent="slate"
          />
        </div>
      </QueryHeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.85fr)]">
        <QuerySectionCard
          title="Resumen financiero"
          description="Montos base y datos operativos de la cuota."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <QueryDetailField
              label="Fecha original"
              value={formatDate(installment.dueDateOriginal)}
            />
            <QueryDetailField
              label="Fecha ajustada"
              value={formatDate(installment.dueDateAdjusted)}
            />
            <QueryDetailField
              label="Estado"
              value={translateLoanApplicationStatus(installment.statusCode, installment.statusName)}
            />
            <QueryDetailField
              label="Capital"
              value={`L ${formatMoney(installment.principalProjected)}`}
            />
            <QueryDetailField
              label="Interés"
              value={`L ${formatMoney(installment.interestProjected)}`}
            />
            <QueryDetailField
              label="Seguro"
              value={`L ${formatMoney(getInstallmentComponentAmount(installment.components, 'INSURANCE'))}`}
            />
            <QueryDetailField
              label="Total"
              value={`L ${formatMoney(installment.totalProjected)}`}
            />
            <QueryDetailField label="Pagado" value={`L ${formatMoney(installment.totalPaid)}`} />
          </div>
        </QuerySectionCard>

        <QuerySectionCard
          title="Señales de pago"
          description="Lectura rápida para cobranza y control."
        >
          <div className="space-y-3">
            <SignalBox
              icon={<Wallet className="h-4 w-4" />}
              label="Saldo pendiente"
              value={`L ${formatMoney(installment.totalProjected - installment.totalPaid)}`}
            />
            <SignalBox
              icon={<Scale className="h-4 w-4" />}
              label="Cobertura"
              value={`${formatMoney(paidRatio)}%`}
            />
            <SignalBox
              icon={<ReceiptText className="h-4 w-4" />}
              label="Componentes pagados"
              value={`L ${formatMoney(componentSummary.paid)}`}
            />
            <SignalBox
              icon={<Coins className="h-4 w-4" />}
              label="Componentes proyectados"
              value={`L ${formatMoney(componentSummary.projected)}`}
            />
          </div>
        </QuerySectionCard>
      </div>

      <QuerySectionCard
        title="Componentes"
        description="Detalle de rubros que componen la cuota y su estado de pago."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <QueryMetricCard
            label="Registros"
            value={String(installment.components.length)}
            hint="Renglones del desglose financiero"
            accent="slate"
          />
          <QueryMetricCard
            label="Proyectado"
            value={`L ${formatMoney(componentSummary.projected)}`}
            hint="Suma de componentes"
            accent="blue"
          />
          <QueryMetricCard
            label="Pagado"
            value={`L ${formatMoney(componentSummary.paid)}`}
            hint="Monto cubierto en componentes"
            accent="emerald"
          />
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
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {component.financialComponentCode}
                        </div>
                      </td>
                      <td className="text-right">{formatMoney(component.amountProjected)}</td>
                      <td className="text-right">{formatMoney(component.amountPaid)}</td>
                      <td className="text-right">
                        {formatMoney(component.amountProjected - component.amountPaid)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </QuerySectionCard>
    </div>
  )
}

const SignalBox = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {icon}
    </span>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </div>
)
