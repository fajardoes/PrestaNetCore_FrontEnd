import type { ReactNode } from 'react'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatRatio,
  financialProfileBadgeClass,
  financialProfileCompletenessBadgeClass,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationRequestedDataCardProps {
  application: LoanApplicationResponse
}

export const LoanApplicationRequestedDataCard = ({
  application,
}: LoanApplicationRequestedDataCardProps) => {
  const isDraft = (application.statusCode ?? '').toUpperCase() === 'DRAFT'
  const returnedToDraftReason = (
    application.returnedToDraftReason ?? application.returnToDraftReason ?? ''
  ).trim()
  const returnedToDraftOperationalDate = (
    application.returnedToDraftOperationalDate ?? ''
  ).trim()
  const workflowCommentsRaw = [
    {
      label: 'Motivo de devolucion a borrador',
      value: isDraft ? returnedToDraftReason : null,
    },
    {
      label: 'Fecha de devolución',
      value: isDraft && returnedToDraftOperationalDate
        ? formatDate(returnedToDraftOperationalDate)
        : null,
    },
    { label: 'Motivo de rechazo', value: application.rejectedReason ?? null },
    { label: 'Motivo de cancelacion', value: application.cancelledReason ?? null },
    {
      label: 'Comentario de flujo',
      value: application.workflowReason ?? application.lastWorkflowReason ?? null,
    },
  ]
  const workflowComments = workflowCommentsRaw
    .map((item) => ({
      label: item.label,
      value: (item.value ?? '').trim(),
    }))
    .filter((item) => item.value.length > 0)
  const hasFinancialProfile = Boolean(application.hasFinancialProfile)
  const isFinancialProfileComplete = Boolean(application.isFinancialProfileComplete)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Datos solicitados</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
        <Info label="Cliente" value={application.clientFullName} />
        <Info
          label="Identidad"
          value={<HnIdentityText value={application.clientIdentityNo} fallback="—" />}
        />
        <Info label="Producto" value={`${application.loanProductCode} - ${application.loanProductName}`} />
        <Info label="Promotor" value={application.promoterClientFullName} />
        <Info label="Capital" value={formatMoney(application.requestedPrincipal)} />
        <Info
          label="Duración solicitada"
          value={`${application.requestedTerm} ${application.requestedTermUnitName}`}
        />
        <Info label="Frecuencia negociada" value={application.requestedPaymentFrequencyName} />
        <Info label="Préstamo desembolsado" value={application.approvedLoanNo || '—'} />
        <Info
          label="Frecuencia predeterminada del producto"
          value={application.suggestedPaymentFrequencyName || '—'}
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Ficha financiera
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${financialProfileBadgeClass(hasFinancialProfile)}`}
            >
              {hasFinancialProfile ? 'Registrada' : 'Sin ficha'}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${financialProfileCompletenessBadgeClass(isFinancialProfileComplete)}`}
            >
              {isFinancialProfileComplete ? 'Completa' : 'Incompleta'}
            </span>
          </div>
          <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <p>Actualizacion: {formatDateTime(application.financialProfileUpdatedAt)}</p>
            <p>Ratio pasivos / activos: {formatRatio(application.financialDebtRatio)}</p>
            <p>
              Ratio pasivos / patrimonio:{' '}
              {formatRatio(application.financialDebtToEquityRatio)}
            </p>
          </div>
        </div>
      </div>
      {application.notes ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {application.notes}
        </div>
      ) : null}
      {workflowComments.length ? (
        <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Comentarios del flujo
          </p>
          {workflowComments.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-wide opacity-80">{item.label}</p>
              <p>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

const Info = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
