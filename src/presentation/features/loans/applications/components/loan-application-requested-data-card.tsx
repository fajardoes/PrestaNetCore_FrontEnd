import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import {
  formatDate,
  formatDateTime,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationRequestedDataCardProps {
  application: LoanApplicationResponse
}

export const LoanApplicationRequestedDataCard = ({
  application,
}: LoanApplicationRequestedDataCardProps) => {
  const isDraft = (application.statusCode ?? '').trim().toUpperCase() === 'DRAFT'
  const workflowComments = [
    {
      label: 'Motivo de devolución a borrador',
      value: isDraft
        ? application.returnedToDraftReason ?? application.returnToDraftReason
        : null,
    },
    {
      label: 'Fecha de devolución',
      value:
        isDraft && application.returnedToDraftOperationalDate
          ? formatDate(application.returnedToDraftOperationalDate)
          : null,
    },
    { label: 'Motivo de rechazo', value: application.rejectedReason },
    { label: 'Motivo de cancelación', value: application.cancelledReason },
    {
      label: 'Comentario de flujo',
      value: application.workflowReason ?? application.lastWorkflowReason,
    },
  ].filter((item) => Boolean(item.value?.trim()))

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Información de la solicitud
      </h2>
      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        <Info label="Frecuencia sugerida por el producto" value={application.suggestedPaymentFrequencyName || '—'} />
        <Info label="Fecha operativa de registro" value={formatDate(application.createdOperationalDate)} />
        <Info label="Condiciones capturadas" value={formatDateTime(application.productConditionsCapturedAt)} />
      </dl>
      {application.notes?.trim() ? (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Observaciones
          </p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-800 dark:text-slate-200">
            {application.notes}
          </p>
        </div>
      ) : null}
      {workflowComments.length ? (
        <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Comentarios del flujo
          </h3>
          <dl className="mt-1.5 space-y-2">
            {workflowComments.map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</dt>
                <dd className="break-words text-sm text-slate-800 dark:text-slate-200">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  )
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="break-words font-medium text-slate-800 dark:text-slate-100">{value}</dd>
  </div>
)
