import type { LoanAllowedAction } from '@/infrastructure/loans/responses/loan-actions-response'
import type { LoanDisbursementReversalEligibilityResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'
import {
  formatDate,
  formatYesNo,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { translateDisbursementReversalMessage } from '@/presentation/features/loans/loans-query/components/loan-disbursement-reversal-ui'
import { CollapsibleSection } from '@/presentation/share/components/collapsible-section'

interface LoanDisbursementReversalEligibilityCardProps {
  eligibility: LoanDisbursementReversalEligibilityResponse | null
  eligibilityError?: string | null
  isLoading?: boolean
  allowedActions: LoanAllowedAction[]
  canExecute: boolean
  canReadEligibility: boolean
  isProcessing?: boolean
  onOpenModal: () => void
  collapsible?: boolean
  defaultExpanded?: boolean
  compact?: boolean
}

export const LoanDisbursementReversalEligibilityCard = ({
  eligibility,
  eligibilityError,
  isLoading = false,
  allowedActions,
  canExecute,
  canReadEligibility,
  isProcessing = false,
  onOpenModal,
  collapsible = false,
  defaultExpanded = true,
  compact = false,
}: LoanDisbursementReversalEligibilityCardProps) => {
  if (!canReadEligibility) {
    return null
  }

  const actionAvailable = allowedActions.includes('reverse_disbursement')
  const actionButton = eligibility?.isEligible && actionAvailable && canExecute ? (
    <button
      type="button"
      className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onOpenModal}
      disabled={isProcessing}
    >
      Revertir desembolso
    </button>
  ) : null

  return (
    <CollapsibleSection
      title="Elegibilidad de reversión de desembolso"
      description="Control de reversión del desembolso y trazabilidad contable."
      aside={actionButton}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
      contentClassName={compact ? 'mt-2' : 'mt-0'}
      compact={compact}
    >

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Consultando elegibilidad de reversión...
        </p>
      ) : null}

      {!isLoading && eligibilityError ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {eligibilityError}
        </div>
      ) : null}

      {!isLoading && !eligibility && !eligibilityError ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          No hay información de elegibilidad disponible para este préstamo.
        </div>
      ) : null}

      {eligibility ? (
        <div className="mt-3 space-y-3">
          <div
            className={`rounded-lg border p-2.5 text-sm ${
              eligibility.isEligible
                ? 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200'
            }`}
          >
            <p className="font-semibold">
              {eligibility.isEligible
                ? 'La reversión está permitida.'
                : 'La reversión está bloqueada para este préstamo.'}
            </p>
            {eligibility.recommendedAction?.trim() ? (
              <p className="mt-1">
                {translateDisbursementReversalMessage(eligibility.recommendedAction)}
              </p>
            ) : null}
            {!eligibility.isEligible && !eligibility.blockingReasons.length ? (
              <p className="mt-1">
                No es posible revertir el desembolso porque el backend no lo habilitó para el
                estado actual.
              </p>
            ) : null}
          </div>

          {!actionAvailable ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              No hay una acción de reversión disponible para este préstamo. La UI no permite
              ejecutar la operación.
            </div>
          ) : null}

          {actionAvailable && !canExecute ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              Tu usuario puede consultar elegibilidad, pero no tiene permiso para ejecutar la
              reversión.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Fecha operativa actual" value={formatDate(eligibility.businessDate)} />
            <Metric
              label="Fecha original del desembolso"
              value={formatDate(eligibility.originalDisbursementDate)}
            />
            <Metric
              label="Ajuste contable requerido"
              value={eligibility.requiresAdjustmentPosting ? 'Sí' : 'No'}
            />
            <Metric
              label="Modos permitidos"
              value={formatPostingModes(eligibility.allowedPostingModes)}
            />
            <Metric label="Tiene pagos" value={formatYesNo(eligibility.hasPayments)} />
            <Metric
              label="Tiene movimientos dependientes"
              value={formatYesNo(eligibility.hasDependentTransactions)}
            />
            <Metric
              label="Tiene devengos reconocidos"
              value={formatYesNo(eligibility.hasAccrualsRecognized)}
            />
            <Metric
              label="Tiene cargos diferidos reconocidos"
              value={formatYesNo(eligibility.hasDeferredChargesRecognized)}
            />
          </div>

          {eligibility.blockingReasons.length ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
              <p className="font-semibold">Motivos de bloqueo</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {eligibility.blockingReasons.map((reason) => (
                  <li key={reason}>{translateDisbursementReversalMessage(reason)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {eligibility.warnings.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              <p className="font-semibold">Advertencias</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {eligibility.warnings.map((warning) => (
                  <li key={warning}>{translateDisbursementReversalMessage(warning)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </CollapsibleSection>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const formatPostingModes = (modes: string[]) => {
  if (!modes.length) return '—'
  return modes
    .map((mode) => (mode.trim().toUpperCase() === 'SYSTEM_REVERSAL' ? 'Reversa del sistema' : mode))
    .join(', ')
}
