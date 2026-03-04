import { Link } from 'react-router-dom'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import { formatDate, statusBadgeClass } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationHeaderCardProps {
  application: LoanApplicationResponse
  canEdit: boolean
  canSubmit: boolean
  canApprove: boolean
  canReject: boolean
  canCancel: boolean
  canReturnToDraft: boolean
  canPreview: boolean
  isProcessingWorkflow?: boolean
  onOpenPaymentPlan: () => void
  onSubmit: () => void
  onApprove: () => void
  onReject: () => void
  onCancel: () => void
  onReturnToDraft: () => void
}

export const LoanApplicationHeaderCard = ({
  application,
  canEdit,
  canSubmit,
  canApprove,
  canReject,
  canCancel,
  canReturnToDraft,
  canPreview,
  isProcessingWorkflow = false,
  onOpenPaymentPlan,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onReturnToDraft,
}: LoanApplicationHeaderCardProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Solicitud {application.applicationNo || application.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ID: {application.id} · Creada: {formatDate(application.createdAt)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {application.statusName}
            </span>
            {application.approvedLoanId ? (
              <Link className="btn-secondary px-3 py-1 text-xs" to={`/loans/${application.approvedLoanId}`}>
                Ir al préstamo
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEdit ? (
            <Link
              className="btn-secondary px-3 py-2 text-sm"
              to={`/loans/applications/${application.id}/edit`}
              state={{ returnTo: `/loans/applications/${application.id}` }}
            >
              Editar
            </Link>
          ) : null}
          {canSubmit ? (
            <button
              type="button"
              className="btn-primary px-3 py-2 text-sm"
              onClick={onSubmit}
              disabled={isProcessingWorkflow}
            >
              Enviar
            </button>
          ) : null}
          {canApprove ? (
            <button
              type="button"
              className="btn-primary px-3 py-2 text-sm"
              onClick={onApprove}
              disabled={isProcessingWorkflow}
            >
              Aprobar
            </button>
          ) : null}
          {canReject ? (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={onReject}
              disabled={isProcessingWorkflow}
            >
              Rechazar
            </button>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={onCancel}
              disabled={isProcessingWorkflow}
            >
              Cancelar
            </button>
          ) : null}
          {canReturnToDraft ? (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={onReturnToDraft}
              disabled={isProcessingWorkflow}
            >
              Devolver a borrador
            </button>
          ) : null}
          {canPreview ? (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={onOpenPaymentPlan}
              disabled={isProcessingWorkflow}
            >
              Previsualizar cronograma
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
