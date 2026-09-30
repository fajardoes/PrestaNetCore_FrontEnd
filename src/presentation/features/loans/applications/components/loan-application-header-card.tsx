import { useEffect, useRef } from 'react'
import {
  ArrowLeftCircle,
  Banknote,
  ChartColumn,
  CheckCircle2,
  ChevronDown,
  Eye,
  Info,
  MoreHorizontal,
  Pencil,
  Printer,
  ReceiptText,
  Send,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import {
  formatDate,
  formatDateTime,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationHeaderCardProps {
  application: LoanApplicationResponse
  canEdit: boolean
  canSubmit: boolean
  canApprove: boolean
  approveBlockedReason?: string | null
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
  approveBlockedReason = null,
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
  const actionsMenuRef = useRef<HTMLDetailsElement | null>(null)
  const actionClassName =
    'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryActionClassName = `${actionClassName} btn-secondary border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900`
  const primaryActionClassName = `${actionClassName} btn-primary shadow-sm`
  const menuItemClassName = 'inline-flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:text-slate-100 dark:hover:bg-slate-800'
  const loanIsDisbursed = (application.statusCode ?? '').trim().toUpperCase() === 'DISBURSED'
  const approvedLoanLabel = (application.approvedLoanNo ?? '').trim()
  const hasSecondaryActions =
    canEdit || canPrint || canGenerateSettlement || canGenerateScoring || canReturnToDraft || canReject || canCancel
  const closeActionsMenu = () => {
    if (actionsMenuRef.current) actionsMenuRef.current.open = false
  }

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const menu = actionsMenuRef.current
      const target = event.target
      if (!menu?.open || !(target instanceof Node) || menu.contains(target)) return
      menu.open = false
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [])

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Solicitud {application.applicationNo || application.id.slice(0, 8)}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {translateLoanApplicationStatus(application.statusCode, application.statusName)}
            </span>
          </div>
          <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">
            {application.clientFullName}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Identidad</span>
              <HnIdentityText value={application.clientIdentityNo} fallback="—" />
            </span>
            <span className="min-w-0 break-words">
              <span className="text-slate-500 dark:text-slate-400">Producto</span>{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {application.loanProductCode} · {application.loanProductName}
              </span>
            </span>
          </div>
          {loanIsDisbursed && application.approvedLoanId ? (
            <Link
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 underline decoration-sky-500/40 underline-offset-2 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
              to={`/loans/${application.approvedLoanId}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {approvedLoanLabel ? `Ver préstamo ${approvedLoanLabel}` : 'Ir al préstamo'}
            </Link>
          ) : null}
          <details className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded px-1 py-0.5 font-medium hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:hover:bg-slate-800">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Datos de registro
            </summary>
            <dl className="mt-1 grid gap-x-4 gap-y-1 rounded-lg bg-slate-50 p-2 sm:grid-cols-2 dark:bg-slate-900">
              <div className="min-w-0">
                <dt>ID de solicitud</dt>
                <dd className="break-all font-mono text-[11px] text-slate-700 dark:text-slate-200">{application.id}</dd>
              </div>
              <div>
                <dt>Creada</dt>
                <dd className="text-slate-700 dark:text-slate-200">{formatDateTime(application.createdAt)}</dd>
              </div>
              <div>
                <dt>Fecha operativa</dt>
                <dd className="text-slate-700 dark:text-slate-200">{formatDate(application.createdOperationalDate)}</dd>
              </div>
            </dl>
          </details>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
          {canPreview ? (
            <button
              type="button"
              className={`${secondaryActionClassName} border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/70`}
              onClick={onOpenPaymentPlan}
              disabled={isProcessingWorkflow}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Ver plan de pagos
            </button>
          ) : null}
          {canSubmit ? (
            <button type="button" className={primaryActionClassName} onClick={onSubmit} disabled={isProcessingWorkflow}>
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              Enviar
            </button>
          ) : null}
          {canApprove ? (
            <button
              type="button"
              className={primaryActionClassName}
              onClick={onApprove}
              disabled={isProcessingWorkflow || Boolean(approveBlockedReason)}
              title={approveBlockedReason ?? 'Aprobar solicitud'}
              aria-describedby={approveBlockedReason ? 'loan-application-approval-blockers' : undefined}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Aprobar
            </button>
          ) : null}
          {canDisburse ? (
            <button type="button" className={primaryActionClassName} onClick={onDisburse} disabled={isProcessingWorkflow}>
              <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
              Desembolsar
            </button>
          ) : null}

          {hasSecondaryActions ? (
            <details
              ref={actionsMenuRef}
              className="relative"
              onKeyDown={(event) => {
                if (event.key !== 'Escape') return
                closeActionsMenu()
                actionsMenuRef.current?.querySelector('summary')?.focus()
              }}
            >
              <summary
                aria-label="Más acciones de la solicitud"
                className={`${secondaryActionClassName} list-none cursor-pointer`}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                Más acciones
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 z-30 mt-1 w-[min(22rem,calc(100vw-2rem))] space-y-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {(canEdit || canPrint || canGenerateSettlement || canGenerateScoring || canReturnToDraft) ? (
                  <div role="group" aria-label="Acciones de revisión" className="space-y-1">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Revisión</p>
                    {canEdit ? (
                      <Link
                        className={menuItemClassName}
                        to={`/loans/applications/${application.id}/edit`}
                        state={{ returnTo: `/loans/applications/${application.id}` }}
                        onClick={closeActionsMenu}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar solicitud
                      </Link>
                    ) : null}
                    {canPrint ? (
                      <button type="button" className={menuItemClassName} onClick={() => { closeActionsMenu(); onPrint() }} disabled={isProcessingWorkflow || isPrinting}>
                        <Printer className="h-4 w-4" aria-hidden="true" />
                        {isPrinting ? 'Generando impresión…' : 'Imprimir solicitud'}
                      </button>
                    ) : null}
                    {canGenerateSettlement ? (
                      <button type="button" className={menuItemClassName} onClick={() => { closeActionsMenu(); onGenerateSettlement() }} disabled={isProcessingWorkflow || isSettlementLoading}>
                        <ReceiptText className="h-4 w-4" aria-hidden="true" />
                        {isSettlementLoading ? 'Generando liquidación…' : 'Generar liquidación'}
                      </button>
                    ) : null}
                    {canGenerateScoring ? (
                      <button type="button" className={menuItemClassName} onClick={() => { closeActionsMenu(); onGenerateScoring() }} disabled={isProcessingWorkflow}>
                        <ChartColumn className="h-4 w-4" aria-hidden="true" />
                        Generar análisis crediticio
                      </button>
                    ) : null}
                    {canReturnToDraft ? (
                      <button type="button" className={menuItemClassName} onClick={() => { closeActionsMenu(); onReturnToDraft() }} disabled={isProcessingWorkflow}>
                        <ArrowLeftCircle className="h-4 w-4" aria-hidden="true" />
                        Devolver a borrador
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {(canReject || canCancel) ? (
                  <div role="group" aria-label="Acciones que cambian el estado" className="border-t border-slate-100 pt-2 dark:border-slate-800">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Acciones de estado</p>
                    {canReject ? (
                      <button type="button" className={`${menuItemClassName} text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10`} onClick={() => { closeActionsMenu(); onReject() }} disabled={isProcessingWorkflow}>
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Rechazar solicitud
                      </button>
                    ) : null}
                    {canCancel ? (
                      <button type="button" className={`${menuItemClassName} text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10`} onClick={() => { closeActionsMenu(); onCancel() }} disabled={isProcessingWorkflow}>
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Cancelar solicitud
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  )
}
