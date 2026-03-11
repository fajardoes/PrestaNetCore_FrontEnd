import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'

interface LoanDisbursementAccountSummaryCardProps {
  state: LoanDisbursementAccountSettingDto | null
  isLoading?: boolean
}

const DetailRow = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)

const StateBadge = ({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'amber' | 'red'
}) => {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}
    >
      {label}
    </span>
  )
}

export const LoanDisbursementAccountSummaryCard = ({
  state,
  isLoading,
}: LoanDisbursementAccountSummaryCardProps) => {
  const configuredTone = !state?.isConfigured
    ? 'amber'
    : state.isValid
      ? 'green'
      : 'red'
  const configuredLabel = !state?.isConfigured
    ? 'Pendiente de configurar'
    : state.isValid
      ? 'Configuración válida'
      : 'Configuración inconsistente'
  const referenceStatus = !state
    ? '—'
    : !state.isConfigured
      ? 'Pendiente'
      : state.isValid
        ? 'Válida'
        : 'Inválida'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Cuenta contable de desembolso
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Define la cuenta que el sistema utilizará como referencia por defecto
            para los desembolsos de préstamos.
          </p>
        </div>
        <StateBadge label={configuredLabel} tone={configuredTone} />
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DetailRow
            label="Estado de configuración"
            value={state?.isConfigured ? 'Configurada' : 'Sin configurar'}
          />
          <DetailRow
            label="Estado de referencia"
            value={referenceStatus}
          />
          <DetailRow
            label="Código contable"
            value={state?.loanDisbursementGlAccountCode?.trim() || '—'}
          />
          <DetailRow
            label="Cuenta"
            value={state?.loanDisbursementGlAccountName?.trim() || '—'}
          />
        </div>
      )}

      {!isLoading && state?.validationMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {state.validationMessage}
        </div>
      ) : null}
    </section>
  )
}
