import type {
  PaymentLookupClientResponse,
  PaymentLookupComponentBalanceResponse,
  PaymentLookupLoanResponse,
} from '@/infrastructure/payments/responses/payment-lookup-response'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import {
  formatCurrency,
  formatDate,
  formatPaymentComponentLabel,
  getPaymentLookupInstallmentStatusBadgeClass,
  getPaymentLookupLoanStatusBadgeClass,
  translatePaymentLookupInstallmentStatus,
  translatePaymentLookupLoanStatus,
} from './payment-ui'

interface PaymentLookupLoanSelectorProps {
  businessDate?: string | null
  client?: PaymentLookupClientResponse | null
  loans: PaymentLookupLoanResponse[]
  selectedLoanId?: string | null
  onSelect: (loan: PaymentLookupLoanResponse) => void
}

interface PaymentLookupLoanSummaryCardProps {
  businessDate?: string | null
  clientName?: string | null
  clientIdentityNo?: string | null
  loan: PaymentLookupLoanResponse
}

const sortComponentBalances = <
  T extends { financialComponentCode?: string | null; id?: string; financialComponentId?: string },
>(
  items: T[],
) =>
  [...items].sort((left, right) => {
    const leftCode = (left.financialComponentCode ?? '').trim().toUpperCase()
    const rightCode = (right.financialComponentCode ?? '').trim().toUpperCase()
    const leftPriority = getComponentPriority(leftCode)
    const rightPriority = getComponentPriority(rightCode)
    if (leftPriority !== rightPriority) return leftPriority - rightPriority
    return leftCode.localeCompare(rightCode)
  })

const getComponentPriority = (code: string) => {
  if (code === 'PRINCIPAL') return 1
  if (code === 'INTEREST') return 2
  if (code === 'PENALTY') return 3
  if (code === 'INSURANCE') return 4
  return 99
}

export const PaymentLookupLoanSelector = ({
  businessDate,
  client,
  loans,
  selectedLoanId,
  onSelect,
}: PaymentLookupLoanSelectorProps) => (
  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <div className="mb-3 flex flex-col gap-1">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Selecciona el préstamo a pagar
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Se encontraron {loans.length} préstamos disponibles para {client?.fullName?.trim() || 'el cliente'}.
      </p>
    </div>

    <div className="grid gap-3 xl:grid-cols-2">
      {loans.map((loan) => {
        const isSelected = selectedLoanId === loan.id
        return (
          <button
            key={loan.id}
            type="button"
            className={`rounded-2xl border p-4 text-left transition ${
              isSelected
                ? 'border-primary bg-white ring-2 ring-primary/20 dark:border-primary/70 dark:bg-slate-950'
                : 'border-slate-200 bg-white hover:border-primary/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-primary/60'
            }`}
            onClick={() => onSelect(loan)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {loan.loanNo?.trim() || loan.id}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {loan.loanProductName?.trim() || 'Producto no especificado'}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentLookupLoanStatusBadgeClass(
                    loan.statusCode,
                  )}`}
                >
                  {translatePaymentLookupLoanStatus(loan.statusCode, loan.statusName)}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Metric label="Saldo pendiente" value={formatCurrency(loan.totalOutstanding)} />
                <Metric label="Para ponerse al día" value={formatCurrency(loan.totalDueAmount)} />
                <Metric
                  label="Cuotas vencidas"
                  value={String(Math.max(0, loan.overdueInstallmentsCount))}
                />
                <Metric
                  label="Próxima cuota"
                  value={formatCurrency(loan.nextPayableInstallment?.outstandingAmount)}
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                <CompactTag label="Moneda" value={loan.currencyCode || '—'} />
                <CompactTag label="Vence desde" value={formatDate(loan.oldestDueDate)} />
                <CompactTag
                  label="Siguiente"
                  value={formatDate(loan.nextPayableInstallment?.dueDateAdjusted)}
                />
                <CompactTag
                  label="Operativa"
                  value={formatDate(businessDate)}
                />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

export const PaymentLookupLoanSummaryCard = ({
  businessDate,
  clientName,
  clientIdentityNo,
  loan,
}: PaymentLookupLoanSummaryCardProps) => {
  const dueBreakdown = sortComponentBalances(loan.dueComponentBalances ?? [])
  const outstandingBreakdown = sortComponentBalances(loan.outstandingComponentBalances ?? [])

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {loan.loanNo?.trim() || 'Préstamo'}
              </h3>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentLookupLoanStatusBadgeClass(
                  loan.statusCode,
                )}`}
              >
                {translatePaymentLookupLoanStatus(loan.statusCode, loan.statusName)}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {loan.loanProductName?.trim() || 'Producto no especificado'}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{clientName?.trim() || 'Cliente no disponible'}</span>
              <span>
                <HnIdentityText value={clientIdentityNo} fallback="—" />
              </span>
              <span>Fecha operativa: {formatDate(businessDate)}</span>
            </div>
          </div>
          <div className="grid min-w-full gap-2 sm:grid-cols-2 lg:min-w-[22rem]">
            <SummaryMetric
              label="Saldo pendiente"
              value={formatCurrency(loan.totalOutstanding)}
              tone="neutral"
            />
            <SummaryMetric
              label="Monto para ponerse al día"
              value={formatCurrency(loan.totalDueAmount)}
              tone={loan.totalDueAmount > 0 ? 'accent' : 'neutral'}
            />
            <SummaryMetric
              label="Vencido"
              value={formatCurrency(loan.totalOverdueAmount)}
              tone={loan.totalOverdueAmount > 0 ? 'danger' : 'neutral'}
            />
            <SummaryMetric
              label="Próxima cuota"
              value={formatCurrency(loan.nextPayableInstallment?.outstandingAmount)}
              tone="neutral"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Capital solicitado" value={formatCurrency(loan.principal)} />
            <MetricCard
              label="Cuotas exigibles"
              value={String(Math.max(0, loan.dueInstallmentsCount))}
            />
            <MetricCard
              label="Cuotas vencidas"
              value={String(Math.max(0, loan.overdueInstallmentsCount))}
            />
            <MetricCard label="Vence desde" value={formatDate(loan.oldestDueDate)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Desglose para ponerse al día"
              subtitle="Componentes exigibles hoy"
              items={dueBreakdown}
              emptyLabel="Sin componentes exigibles"
            />
            <BreakdownCard
              title="Desglose del saldo pendiente"
              subtitle="Composición total del préstamo"
              items={outstandingBreakdown}
              emptyLabel="Sin saldo pendiente"
            />
          </div>
        </div>

        <NextInstallmentCard loan={loan} />
      </div>
    </div>
  )
}

const NextInstallmentCard = ({ loan }: { loan: PaymentLookupLoanResponse }) => {
  const installment = loan.nextPayableInstallment
  if (!installment) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Próxima cuota</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No hay cuota pendiente disponible en la consulta.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Próxima cuota</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cuota #{installment.installmentNo}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentLookupInstallmentStatusBadgeClass(
            installment.statusCode,
          )}`}
        >
          {translatePaymentLookupInstallmentStatus(
            installment.statusCode,
            installment.statusName,
          )}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard label="Vencimiento" value={formatDate(installment.dueDateAdjusted)} />
        <MetricCard label="Pendiente" value={formatCurrency(installment.outstandingAmount)} />
        <MetricCard label="Proyectado" value={formatCurrency(installment.totalProjected)} />
        <MetricCard label="Pagado" value={formatCurrency(installment.totalPaid)} />
      </div>

      <div className="mt-4 space-y-2">
        {sortComponentBalances(installment.components).map((component) => (
          <div
            key={component.id ?? `${component.financialComponentId}-${component.financialComponentCode}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                {formatPaymentComponentLabel(
                  component.financialComponentCode,
                  component.financialComponentName,
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proyectado {formatCurrency(component.amountProjected)}
              </p>
            </div>
            <p className="pl-3 text-right font-semibold text-slate-900 dark:text-slate-50">
              {formatCurrency(component.outstandingAmount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const BreakdownCard = ({
  title,
  subtitle,
  items,
  emptyLabel,
}: {
  title: string
  subtitle: string
  items: PaymentLookupComponentBalanceResponse[]
  emptyLabel: string
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>

    <div className="mt-4 space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      ) : (
        items.map((item) => (
          <div
            key={`${item.financialComponentId}-${item.financialComponentCode}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {formatPaymentComponentLabel(
                item.financialComponentCode,
                item.financialComponentName,
              )}
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              {formatCurrency(item.outstandingAmount)}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)

const SummaryMetric = ({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'neutral' | 'accent' | 'danger'
}) => {
  const toneClass =
    tone === 'accent'
      ? 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10'
      : tone === 'danger'
        ? 'border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-500/10'
        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className={`rounded-xl border px-3 py-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  )
}

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
  </div>
)

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const CompactTag = ({ label, value }: { label: string; value: string }) => (
  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950">
    {label}: {value}
  </span>
)
