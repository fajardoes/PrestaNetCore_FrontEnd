import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import type { LoanDisbursementReversalRequest } from '@/infrastructure/loans/requests/loan-disbursement-reversal-request'
import type { LoanDisbursementReversalEligibilityResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'
import {
  loanDisbursementReversalSchema,
  type LoanDisbursementReversalFormValues,
} from '@/infrastructure/validations/loans/loan-disbursement-reversal.schema'
import {
  formatDate,
  formatCurrency,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanDisbursementReversalModalProps {
  open: boolean
  loan: LoanResponse
  eligibility: LoanDisbursementReversalEligibilityResponse
  isProcessing?: boolean
  submitError?: string | null
  onCancel: () => void
  onConfirm: (payload: LoanDisbursementReversalRequest) => Promise<void> | void
}

export const LoanDisbursementReversalModal = ({
  open,
  loan,
  eligibility,
  isProcessing = false,
  submitError,
  onCancel,
  onConfirm,
}: LoanDisbursementReversalModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoanDisbursementReversalFormValues>({
    resolver: yupResolver(loanDisbursementReversalSchema),
    defaultValues: {
      reason: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) {
      reset({ reason: '', notes: '' })
    }
  }, [open, reset])

  const reason = watch('reason') ?? ''
  const notes = watch('notes') ?? ''

  return (
    <ConfirmModal
      open={open}
      title="Confirmar reversión de desembolso"
      description="Esta acción revertirá históricamente el desembolso del préstamo y generará el asiento contable inverso. La operación no puede deshacerse de forma automática."
      confirmLabel="Revertir desembolso"
      cancelLabel="Cancelar"
      panelClassName="max-w-4xl"
      isProcessing={isProcessing}
      onCancel={onCancel}
      onConfirm={() => {
        void handleSubmit(async (values) => {
          await onConfirm({
            reason: values.reason.trim(),
            notes: values.notes?.trim() ? values.notes.trim() : null,
            requestedPostingMode: eligibility.allowedPostingModes.includes('SYSTEM_REVERSAL')
              ? 'SYSTEM_REVERSAL'
              : undefined,
            forceAsAdjustment: eligibility.requiresAdjustmentPosting,
          })
        })()
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Préstamo" value={loan.loanNo?.trim() || loan.id} />
          <Metric label="Fecha operativa actual" value={formatDate(eligibility.businessDate)} />
          <Metric
            label="Fecha original del desembolso"
            value={formatDate(eligibility.originalDisbursementDate)}
          />
          <Metric
            label="Asiento original"
            value={loan.disbursementJournalEntryNumber?.trim() || loan.disbursementJournalEntryId || '—'}
          />
          <Metric label="Capital" value={formatCurrency(loan.principal)} />
          <Metric
            label="Neto desembolsado"
            value={formatCurrency(loan.netDisbursementAmount)}
          />
          <Metric
            label="Modo de registro"
            value={formatPostingModes(eligibility.allowedPostingModes)}
          />
          <Metric
            label="Tipo de contabilización"
            value={
              eligibility.requiresAdjustmentPosting ? 'Ajuste contable' : 'Reversa directa'
            }
          />
        </div>

        {eligibility.requiresAdjustmentPosting ? (
          <Alert tone="warning">
            La reversa será registrada como ajuste contable en un período anterior.
          </Alert>
        ) : null}

        <Alert tone="info">
          Esta operación no elimina la historia del préstamo ni sus asientos; registra una
          reversión formal.
        </Alert>

        {eligibility.warnings.length ? (
          <Alert tone="warning">
            <ul className="space-y-1">
              {eligibility.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        {submitError ? <Alert tone="danger">{submitError}</Alert> : null}

        <div className="space-y-1">
          <label
            htmlFor="loan-reversal-reason"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Motivo de reversión *
          </label>
          <textarea
            id="loan-reversal-reason"
            rows={3}
            maxLength={500}
            {...register('reason')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Máximo 500 caracteres.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{reason.length}/500</p>
          </div>
          {errors.reason?.message ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.reason.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="loan-reversal-notes"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Notas internas
          </label>
          <textarea
            id="loan-reversal-notes"
            rows={4}
            maxLength={1000}
            {...register('notes')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Máximo 1000 caracteres.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{notes.length}/1000</p>
          </div>
          {errors.notes?.message ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.notes.message}</p>
          ) : null}
        </div>
      </div>
    </ConfirmModal>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const Alert = ({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'info' | 'warning' | 'danger'
}) => {
  const className =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100'
        : 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100'

  return <div className={`rounded-xl border p-3 text-sm ${className}`}>{children}</div>
}

const formatPostingModes = (modes: string[]) => {
  if (!modes.length) return '—'
  return modes
    .map((mode) => (mode.trim().toUpperCase() === 'SYSTEM_REVERSAL' ? 'Reversa del sistema' : mode))
    .join(', ')
}
