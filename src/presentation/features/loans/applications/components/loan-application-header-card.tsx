import {
  ArrowLeftCircle,
  Banknote,
  ChartColumn,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Pencil,
  Printer,
  ReceiptText,
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
  canGenerateScoring?: boolean
  canGenerateSettlement?: boolean
  isProcessingWorkflow?: boolean
  isPrinting?: boolean
  isSettlementLoading?: boolean
  onOpenFinancialProfile: () => void
  onOpenPaymentPlan: () => void
  onPrint: () => void
  onGenerateSettlement: () => void
  onGenerateScoring: () => void
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
  canGenerateScoring = false,
  canGenerateSettlement = false,
  isProcessingWorkflow = false,
  isPrinting = false,
  isSettlementLoading = false,
  onOpenFinancialProfile,
  onOpenPaymentPlan,
  onPrint,
  onGenerateSettlement,
  onGenerateScoring,
  onSubmit,
  onApprove,
  onDisburse,
  onReject,
  onCancel,
  onReturnToDraft,
}: LoanApplicationHeaderCardProps) => {
  const actionClassName =
    'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryActionClassName = `${actionClassName} btn-secondary border-slate-300/90 bg-white/90 hover:bg-white dark:border-slate-700/90 dark:bg-slate-900/90`
  const primaryActionClassName = `${actionClassName} btn-primary shadow-lg shadow-primary/15`
  const dangerActionClassName =
    'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20 dark:focus:ring-red-500/40 dark:focus:ring-offset-slate-950'
  const loanIsDisbursed = (application.statusCode ?? '').trim().toUpperCase() === 'DISBURSED'
  const approvedLoanLabel = (application.approvedLoanNo ?? '').trim()

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Solicitud {application.applicationNo || application.id.slice(0, 8)}
          </h1>
          <p className="truncate text-xs text-slate-600 dark:text-slate-400" title={application.id}>
            ID: {application.id} · Creada: {formatDate(application.createdAt)}
          </p>
          {loanIsDisbursed && approvedLoanLabel ? (
            <p className="mt-0.5 text-xs text-sky-700 dark:text-sky-300">
              Préstamo desembolsado: {approvedLoanLabel}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {translateLoanApplicationStatus(application.statusCode, application.statusName)}
            </span>
            {loanIsDisbursed && application.approvedLoanId ? (
              <Link
                className="btn-secondary inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs"
                to={`/loans/${application.approvedLoanId}`}
              >
                <Eye className="h-3.5 w-3.5" />
                {approvedLoanLabel ? `Ver préstamo ${approvedLoanLabel}` : 'Ir al préstamo'}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="w-full min-[1180px]:w-auto">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Acciones disponibles
            </p>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {canEdit ? (
                <Link
                  className={secondaryActionClassName}
                  to={`/loans/applications/${application.id}/edit`}
                  state={{ returnTo: `/loans/applications/${application.id}` }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Link>
              ) : null}
              <button
                type="button"
                className={secondaryActionClassName}
                onClick={onOpenFinancialProfile}
                disabled={isProcessingWorkflow}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Ficha financiera
              </button>
              {canPreview ? (
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={onOpenPaymentPlan}
                  disabled={isProcessingWorkflow}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver plan de pagos
                </button>
              ) : null}
              {canPrint ? (
                <button
                  type="button"
                  className="btn-print min-h-9 px-3 py-1.5 text-xs"
                  onClick={onPrint}
                  disabled={isProcessingWorkflow || isPrinting}
                >
                  <Printer className="h-3.5 w-3.5" />
                  {isPrinting ? 'Generando...' : 'Imprimir'}
                </button>
              ) : null}
              {canGenerateSettlement ? (
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={onGenerateSettlement}
                  disabled={isProcessingWorkflow || isSettlementLoading}
                >
                  <ReceiptText className="h-3.5 w-3.5" />
                  {isSettlementLoading ? 'Generando liquidación...' : 'Generar liquidación'}
                </button>
              ) : null}
              {canGenerateScoring ? (
                <button
                  type="button"
                  className={secondaryActionClassName}
                  onClick={onGenerateScoring}
                  disabled={isProcessingWorkflow}
                >
                  <ChartColumn className="h-3.5 w-3.5" />
                  Generar scoring crediticio
                </button>
              ) : null}
              {canSubmit ? (
                <button
                  type="button"
                  className={primaryActionClassName}
                  onClick={onSubmit}
                  disabled={isProcessingWorkflow}
                >
                  <Send className="h-3.5 w-3.5" />
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
                  <CheckCircle2 className="h-3.5 w-3.5" />
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
                  <Banknote className="h-3.5 w-3.5" />
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
                  <XCircle className="h-3.5 w-3.5" />
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
                  <XCircle className="h-3.5 w-3.5" />
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
                  <ArrowLeftCircle className="h-3.5 w-3.5" />
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
