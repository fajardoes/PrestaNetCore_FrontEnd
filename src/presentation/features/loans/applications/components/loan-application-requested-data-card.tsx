import type { ReactNode } from 'react'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationRequestedDataCardProps {
  application: LoanApplicationResponse
}

export const LoanApplicationRequestedDataCard = ({
  application,
}: LoanApplicationRequestedDataCardProps) => {
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
        <Info label="Principal" value={formatMoney(application.requestedPrincipal)} />
        <Info label="Plazo" value={String(application.requestedTerm)} />
        <Info label="Frecuencia" value={application.requestedPaymentFrequencyName} />
        <Info
          label="Frecuencia sugerida"
          value={application.suggestedPaymentFrequencyName || '—'}
        />
      </div>
      {application.notes ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {application.notes}
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
