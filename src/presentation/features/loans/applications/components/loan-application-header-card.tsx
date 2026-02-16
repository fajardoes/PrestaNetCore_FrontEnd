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
  canPreview: boolean
  isProcessingWorkflow?: boolean
  onOpenPaymentPlan: () => void
  onSubmit: () => void
  onApprove: () => void
  onReject: () => void
  onCancel: () => void
}

export const LoanApplicationHeaderCard = ({
  application,
  canEdit,
  canSubmit,
  canApprove,
  canReject,
  canCancel,
  canPreview,
  isProcessingWorkflow = false,
  onOpenPaymentPlan,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
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
          <button
            type="button"
            className="btn-primary px-3 py-2 text-sm"
            onClick={onSubmit}
            disabled={!canSubmit || isProcessingWorkflow}
          >
            Enviar
          </button>
          <button
            type="button"
            className="btn-primary px-3 py-2 text-sm"
            onClick={onApprove}
            disabled={!canApprove || isProcessingWorkflow}
          >
            Aprobar
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-2 text-sm"
            onClick={onReject}
            disabled={!canReject || isProcessingWorkflow}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-2 text-sm"
            onClick={onCancel}
            disabled={!canCancel || isProcessingWorkflow}
          >
            Cancelar
          </button>
          {canPreview ? (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={onOpenPaymentPlan}
              disabled={isProcessingWorkflow}
            >
              Generar plan de pagos
            </button>
          ) : (
            <span className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Plan de pagos: no disponible en este estado
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
