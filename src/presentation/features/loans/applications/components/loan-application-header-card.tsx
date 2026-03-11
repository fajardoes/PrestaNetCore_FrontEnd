import {
  ArrowLeftCircle,
  Banknote,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Pencil,
  Printer,
  Send,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import {
  formatDate,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationHeaderCardProps {
  application: LoanApplicationResponse
  canEdit: boolean
  canSubmit: boolean
  canApprove: boolean
  canDisburse: boolean
  canReject: boolean
  canCancel: boolean
  canReturnToDraft: boolean
  canPreview: boolean
  canPrint: boolean
  isProcessingWorkflow?: boolean
  isPrinting?: boolean
  onOpenFinancialProfile: () => void
  onOpenPaymentPlan: () => void
  onPrint: () => void
  onSubmit: () => void
  onApprove: () => void
  onDisburse: () => void
  onReject: () => void
  onCancel: () => void
  onReturnToDraft: () => void
}

export const LoanApplicationHeaderCard = ({
  application,
  canEdit,
  canSubmit,
  canApprove,
  canDisburse,
  canReject,
  canCancel,
  canReturnToDraft,
  canPreview,
  canPrint,
  isProcessingWorkflow = false,
  isPrinting = false,
  onOpenFinancialProfile,
  onOpenPaymentPlan,
  onPrint,
  onSubmit,
  onApprove,
  onDisburse,
  onReject,
  onCancel,
  onReturnToDraft,
}: LoanApplicationHeaderCardProps) => {
  const actionClassName =
    'inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryActionClassName = `${actionClassName} btn-secondary border-slate-300/90 bg-white/90 hover:bg-white dark:border-slate-700/90 dark:bg-slate-900/90`
  const primaryActionClassName = `${actionClassName} btn-primary shadow-lg shadow-primary/15`
  const dangerActionClassName =
    'inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20 dark:focus:ring-red-500/40 dark:focus:ring-offset-slate-950'
  const loanIsDisbursed = (application.statusCode ?? '').trim().toUpperCase() === 'DISBURSED'
  const approvedLoanLabel = (application.approvedLoanNo ?? '').trim()

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
          {loanIsDisbursed && approvedLoanLabel ? (
            <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
              Préstamo desembolsado: {approvedLoanLabel}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {translateLoanApplicationStatus(application.statusCode, application.statusName)}
            </span>
            {loanIsDisbursed && application.approvedLoanId ? (
              <Link
                className="btn-secondary inline-flex items-center gap-2 px-3 py-1 text-xs"
                to={`/loans/${application.approvedLoanId}`}
              >
                <Eye className="h-3.5 w-3.5" />
                {approvedLoanLabel ? `Ver préstamo ${approvedLoanLabel}` : 'Ir al préstamo'}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="w-full min-[1180px]:w-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Acciones disponibles
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canEdit ? (
                <Link
                  className={secondaryActionClassName}
                  to={`/loans/applications/${application.id}/edit`}
                  state={{ returnTo: `/loans/applications/${application.id}` }}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              ) : null}
              <button
                type="button"
                className={secondaryActionClassName}
                onClick={onOpenFinancialProfile}
                disabled={isProcessingWorkflow}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Ficha financiera
              </button>
              {canPreview ? (
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={onOpenPaymentPlan}
                  disabled={isProcessingWorkflow}
                >
                  <Eye className="h-4 w-4" />
                  Ver plan de pagos
                </button>
              ) : null}
              {canPrint ? (
                <button
                  type="button"
                  className="btn-print min-h-10 px-4 py-2"
                  onClick={onPrint}
                  disabled={isProcessingWorkflow || isPrinting}
                >
                  <Printer className="h-4 w-4" />
                  {isPrinting ? 'Generando...' : 'Imprimir'}
                </button>
              ) : null}
              {canSubmit ? (
                <button
                  type="button"
                  className={primaryActionClassName}
                  onClick={onSubmit}
                  disabled={isProcessingWorkflow}
                >
                  <Send className="h-4 w-4" />
                  Enviar
                </button>
              ) : null}
              {canApprove ? (
                <button
                  type="button"
                  className={primaryActionClassName}
                  onClick={onApprove}
                  disabled={isProcessingWorkflow}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </button>
              ) : null}
              {canDisburse ? (
                <button
                  type="button"
                  className={primaryActionClassName}
                  onClick={onDisburse}
                  disabled={isProcessingWorkflow}
                >
                  <Banknote className="h-4 w-4" />
                  Desembolsar
                </button>
              ) : null}
              {canReject ? (
                <button
                  type="button"
                  className={dangerActionClassName}
                  onClick={onReject}
                  disabled={isProcessingWorkflow}
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </button>
              ) : null}
              {canCancel ? (
                <button
                  type="button"
                  className={dangerActionClassName}
                  onClick={onCancel}
                  disabled={isProcessingWorkflow}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              ) : null}
              {canReturnToDraft ? (
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={onReturnToDraft}
                  disabled={isProcessingWorkflow}
                >
                  <ArrowLeftCircle className="h-4 w-4" />
                  Devolver a borrador
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
