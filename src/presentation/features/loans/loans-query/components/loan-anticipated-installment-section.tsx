import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ApiResult } from '@/core/helpers/api-result'
import type {
  ApplyAnticipatedInstallmentRequest,
  ReverseAnticipatedInstallmentApplicationRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentApplicationResponse,
  AnticipatedInstallmentLoanDetailResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'
import {
  anticipatedInstallmentApplySchema,
  anticipatedInstallmentReasonSchema,
  type AnticipatedInstallmentApplyValues,
  type AnticipatedInstallmentReasonValues,
} from '@/infrastructure/validations/loans/anticipated-installment.schema'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { TableContainer } from '@/presentation/share/components/table-container'
import {
  formatCurrency,
  formatDateTime,
  formatFinancialComponentCode,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import {
  anticipatedInstallmentEventLabel,
  anticipatedInstallmentStatusClass,
  anticipatedInstallmentStatusLabel,
  formatAnticipatedInstallmentDate,
} from '@/presentation/features/loans/anticipated-installment/anticipated-installment-ui'

interface Props {
  detail: AnticipatedInstallmentLoanDetailResponse | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  canApply: boolean
  canReverse: boolean
  onApply: (payload: ApplyAnticipatedInstallmentRequest) => Promise<ApiResult<AnticipatedInstallmentApplicationResponse>>
  onReverse: (applicationId: string, payload: ReverseAnticipatedInstallmentApplicationRequest) => Promise<ApiResult<AnticipatedInstallmentApplicationResponse>>
  onRefreshActions: () => Promise<void>
}

export const LoanAnticipatedInstallmentSection = ({
  detail,
  isLoading,
  isSaving,
  error,
  canApply,
  canReverse,
  onApply,
  onReverse,
  onRefreshActions,
}: Props) => {
  const [applyOpen, setApplyOpen] = useState(false)
  const [reverseTarget, setReverseTarget] = useState<AnticipatedInstallmentApplicationResponse | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [operationError, setOperationError] = useState<string | null>(null)
  const applyForm = useForm<AnticipatedInstallmentApplyValues>({
    resolver: yupResolver(anticipatedInstallmentApplySchema),
    defaultValues: { applyFullPending: true, amount: null, reason: null },
  })
  const reverseForm = useForm<AnticipatedInstallmentReasonValues>({
    resolver: yupResolver(anticipatedInstallmentReasonSchema),
    defaultValues: { reason: '' },
  })
  const applyFullPending = applyForm.watch('applyFullPending')

  useEffect(() => {
    if (applyOpen) {
      applyForm.reset({ applyFullPending: true, amount: null, reason: null })
      setOperationError(null)
    }
  }, [applyForm, applyOpen])

  useEffect(() => {
    if (reverseTarget) {
      reverseForm.reset({ reason: '' })
      setOperationError(null)
    }
  }, [reverseForm, reverseTarget])

  const submitApply = applyForm.handleSubmit(async (values) => {
    setOperationError(null)
    const result = await onApply({
      amount: values.applyFullPending ? null : values.amount,
      applyFullPending: values.applyFullPending,
      reason: values.reason?.trim() || null,
      idempotencyKey: null,
    })
    if (!result.success) {
      setOperationError(result.error)
      if (result.status === 403) await onRefreshActions()
      return
    }
    setApplyOpen(false)
    await onRefreshActions()
  })

  const submitReverse = reverseForm.handleSubmit(async (values) => {
    if (!reverseTarget) return
    setOperationError(null)
    const result = await onReverse(reverseTarget.id, { reason: values.reason.trim() })
    if (!result.success) {
      setOperationError(result.error)
      if (result.status === 403) await onRefreshActions()
      return
    }
    setReverseTarget(null)
    await onRefreshActions()
  })

  const installment = detail?.anticipatedInstallment

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cuota anticipada</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Saldo contabilizado al desembolso y aplicaciones distribuidas por el servidor.
          </p>
        </div>
        {canApply && installment && installment.pendingAmount > 0 ? (
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => setApplyOpen(true)}>
            Aplicar cuota anticipada
          </button>
        ) : null}
      </div>
      {isLoading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Consultando cuota anticipada...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {!isLoading && !error && !installment ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Este préstamo no tiene cuota anticipada contabilizada.
        </p>
      ) : null}
      {detail && installment ? (
        <>
          <div className="mt-4 flex gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${anticipatedInstallmentStatusClass(installment.statusCode)}`}>
              {anticipatedInstallmentStatusLabel(installment.statusCode, installment.statusName)}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Monto actual" value={formatCurrency(installment.currentAmount)} />
            <Metric label="Aplicado" value={formatCurrency(installment.appliedAmount)} />
            <Metric label="Pendiente" value={formatCurrency(installment.pendingAmount)} />
            <Metric label="Fecha contabilización" value={formatAnticipatedInstallmentDate(installment.accountingRegisteredBusinessDate)} />
            <Metric label="Asiento" value={installment.disbursementJournalEntryNumber?.trim() || '—'} />
            <Metric label="Registrada" value={formatAnticipatedInstallmentDate(installment.createdBusinessDate)} />
          </div>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-900 dark:text-slate-100">Aplicaciones</h3>
          <TableContainer mode="legacy-compact" variant="strong">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead><tr><th>Fecha</th><th className="text-right">Monto</th><th>Estado</th><th>Motivo</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {!detail.applications.length ? (
                    <tr><td colSpan={5} className="py-5 text-center text-slate-500 dark:text-slate-400">No hay aplicaciones registradas.</td></tr>
                  ) : detail.applications.map((application) => (
                    <Fragment key={application.id}>
                      <tr>
                        <td>{formatAnticipatedInstallmentDate(application.businessDate)}</td>
                        <td className="text-right">{formatCurrency(application.amount)}</td>
                        <td>{anticipatedInstallmentStatusLabel(application.applicationStatusCode)}</td>
                        <td>{application.reason?.trim() || '—'}</td>
                        <td className="space-x-2 text-right">
                          <button type="button" className="btn-table-action" onClick={() => setExpanded((items) => items.includes(application.id) ? items.filter((id) => id !== application.id) : [...items, application.id])}>
                            {expanded.includes(application.id) ? 'Ocultar' : 'Distribución'}
                          </button>
                          {canReverse && application.applicationStatusCode === 'APPLIED' ? (
                            <button type="button" className="btn-table-action" onClick={() => setReverseTarget(application)}>Reversar</button>
                          ) : null}
                        </td>
                      </tr>
                      {expanded.includes(application.id) ? (
                        <tr key={`${application.id}-allocations`}>
                          <td colSpan={5} className="bg-slate-50 dark:bg-slate-900/70">
                            <AllocationTable application={application} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </TableContainer>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-900 dark:text-slate-100">Historial</h3>
          <div className="space-y-2">
            {detail.history.length ? detail.history.map((event) => (
              <div key={event.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                <span className="font-medium text-slate-900 dark:text-slate-100">{anticipatedInstallmentEventLabel(event.eventCode)}</span>
                <span className="text-slate-500 dark:text-slate-400">{formatDateTime(event.createdAt)}</span>
              </div>
            )) : <p className="text-sm text-slate-500 dark:text-slate-400">No hay eventos registrados.</p>}
          </div>
        </>
      ) : null}

      <ConfirmModal open={applyOpen} title="Aplicar cuota anticipada" description="El backend determina las cuotas y componentes que reciben la aplicación." confirmLabel="Aplicar" isProcessing={isSaving} onCancel={() => setApplyOpen(false)} onConfirm={() => void submitApply()}>
        <form className="space-y-3" onSubmit={submitApply}>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="radio" checked={applyFullPending} onChange={() => applyForm.setValue('applyFullPending', true)} />
            Aplicar todo el saldo pendiente
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="radio" checked={!applyFullPending} onChange={() => applyForm.setValue('applyFullPending', false)} />
            Aplicar monto parcial
          </label>
          {!applyFullPending ? (
            <label className="block space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <span>Monto *</span>
              <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...applyForm.register('amount')} />
              {applyForm.formState.errors.amount?.message ? <span className="block text-xs text-red-600 dark:text-red-300">{applyForm.formState.errors.amount.message}</span> : null}
            </label>
          ) : null}
          <label className="block space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <span>Motivo</span>
            <textarea rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...applyForm.register('reason')} />
          </label>
          {operationError ? <p className="text-sm text-red-600 dark:text-red-300">{operationError}</p> : null}
        </form>
      </ConfirmModal>

      <ConfirmModal open={Boolean(reverseTarget)} title="Reversar aplicación" description="La reversa queda registrada en el historial y requiere motivo." confirmLabel="Reversar" isProcessing={isSaving} onCancel={() => setReverseTarget(null)} onConfirm={() => void submitReverse()}>
        <form onSubmit={submitReverse}>
          <label className="block space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <span>Motivo *</span>
            <textarea rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...reverseForm.register('reason')} />
            {reverseForm.formState.errors.reason?.message ? <span className="block text-xs text-red-600 dark:text-red-300">{reverseForm.formState.errors.reason.message}</span> : null}
          </label>
          {operationError ? <p className="mt-2 text-sm text-red-600 dark:text-red-300">{operationError}</p> : null}
        </form>
      </ConfirmModal>
    </section>
  )
}

const AllocationTable = ({ application }: { application: AnticipatedInstallmentApplicationResponse }) => {
  const allocations = [...application.allocations].sort(
    (a, b) => a.installmentNo - b.installmentNo || a.allocationOrder - b.allocationOrder,
  )
  return (
    <table className="min-w-full">
      <thead><tr><th>Cuota</th><th>Componente</th><th className="text-right">Monto aplicado</th></tr></thead>
      <tbody>
        {allocations.map((allocation) => (
          <tr key={allocation.loanInstallmentComponentId}>
            <td>{allocation.installmentNo}</td>
            <td>{formatFinancialComponentCode(allocation.componentCode)}</td>
            <td className="text-right">{formatCurrency(allocation.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
