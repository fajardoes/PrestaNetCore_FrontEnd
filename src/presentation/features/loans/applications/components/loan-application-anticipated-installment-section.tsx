import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import type { ApiResult } from '@/core/helpers/api-result'
import type {
  CancelAnticipatedInstallmentRequest,
  UpsertAnticipatedInstallmentRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentEventResponse,
  AnticipatedInstallmentLimitPreviewResponse,
  AnticipatedInstallmentResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'
import {
  anticipatedInstallmentReasonSchema,
  anticipatedInstallmentUpsertSchema,
  type AnticipatedInstallmentReasonValues,
  type AnticipatedInstallmentUpsertValues,
} from '@/infrastructure/validations/loans/anticipated-installment.schema'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import {
  formatCurrency,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import {
  anticipatedInstallmentEventLabel,
  anticipatedInstallmentStatusClass,
  anticipatedInstallmentStatusLabel,
  formatAnticipatedInstallmentDate,
} from '@/presentation/features/loans/anticipated-installment/anticipated-installment-ui'

interface Props {
  data: AnticipatedInstallmentResponse | null
  history: AnticipatedInstallmentEventResponse[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  canManage: boolean
  canCancel: boolean
  onPreview: (amount: number) => Promise<ApiResult<AnticipatedInstallmentLimitPreviewResponse>>
  onSave: (payload: UpsertAnticipatedInstallmentRequest) => Promise<ApiResult<AnticipatedInstallmentResponse>>
  onCancel: (payload: CancelAnticipatedInstallmentRequest) => Promise<ApiResult<AnticipatedInstallmentResponse>>
  onRefreshActions: () => Promise<void>
}

export const LoanApplicationAnticipatedInstallmentSection = ({
  data,
  history,
  isLoading,
  isSaving,
  error,
  canManage,
  canCancel,
  onPreview,
  onSave,
  onCancel,
  onRefreshActions,
}: Props) => {
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [preview, setPreview] = useState<AnticipatedInstallmentLimitPreviewResponse | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const upsertForm = useForm<AnticipatedInstallmentUpsertValues>({
    resolver: yupResolver(anticipatedInstallmentUpsertSchema),
    defaultValues: { amount: 0, reason: null, notes: null },
  })
  const cancelForm = useForm<AnticipatedInstallmentReasonValues>({
    resolver: yupResolver(anticipatedInstallmentReasonSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (!editOpen) return
    upsertForm.reset({
      amount: data?.currentAmount ?? 0,
      reason: null,
      notes: data?.notes ?? null,
    })
    setPreview(null)
    setOperationError(null)
  }, [data, editOpen, upsertForm])

  useEffect(() => {
    if (cancelOpen) {
      cancelForm.reset({ reason: '' })
      setOperationError(null)
    }
  }, [cancelForm, cancelOpen])

  const submitUpsert = upsertForm.handleSubmit(async (values) => {
    setOperationError(null)
    const previewResult = await onPreview(values.amount)
    if (!previewResult.success) {
      setOperationError(previewResult.error)
      if (previewResult.status === 403) await onRefreshActions()
      return
    }
    setPreview(previewResult.data)
    if (!previewResult.data.isAllowed) return
    const result = await onSave({
      amount: values.amount,
      reason: values.reason?.trim() || null,
      notes: values.notes?.trim() || null,
      idempotencyKey: null,
    })
    if (!result.success) {
      setOperationError(result.error)
      if (result.status === 403) await onRefreshActions()
      return
    }
    setEditOpen(false)
    await onRefreshActions()
  })

  const submitCancellation = cancelForm.handleSubmit(async (values) => {
    setOperationError(null)
    const result = await onCancel({ reason: values.reason.trim() })
    if (!result.success) {
      setOperationError(result.error)
      if (result.status === 403) await onRefreshActions()
      return
    }
    setCancelOpen(false)
    await onRefreshActions()
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cuota anticipada</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monto registrado antes del desembolso y movimientos informados por el servidor.
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (!data || data.canModify) ? (
            <button type="button" className="btn-primary px-3 py-2 text-sm" onClick={() => setEditOpen(true)}>
              {data ? 'Editar monto' : 'Registrar monto'}
            </button>
          ) : null}
          {canCancel && data?.canCancel ? (
            <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={() => setCancelOpen(true)}>
              Cancelar cuota
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Consultando cuota anticipada...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {!isLoading && !error && !data ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Esta solicitud no tiene una cuota anticipada registrada.
        </p>
      ) : null}
      {data ? (
        <>
          <div className="mt-4 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${anticipatedInstallmentStatusClass(data.statusCode)}`}>
              {anticipatedInstallmentStatusLabel(data.statusCode, data.statusName)}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Monto original" value={formatCurrency(data.originalAmount)} />
            <Metric label="Monto actual" value={formatCurrency(data.currentAmount)} />
            <Metric label="Aplicado" value={formatCurrency(data.appliedAmount)} />
            <Metric label="Pendiente" value={formatCurrency(data.pendingAmount)} />
            <Metric label="Máximo permitido" value={data.maxAllowedAmountSnapshot == null ? '—' : formatCurrency(data.maxAllowedAmountSnapshot)} />
            <Metric label="Fecha de registro" value={formatAnticipatedInstallmentDate(data.createdBusinessDate)} />
          </div>
          {data.notes ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Notas: {data.notes}</p> : null}
        </>
      ) : null}
      {data ? (
        <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historial</h3>
          {!history.length ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No hay eventos registrados.</p> : (
            <div className="mt-3 space-y-2">
              {history.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{anticipatedInstallmentEventLabel(event.eventCode)}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatAnticipatedInstallmentDate(event.businessDate)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Código: {event.eventCode}{event.newAmount == null ? '' : ` · Monto: ${formatCurrency(event.newAmount)}`}
                  </p>
                  {event.reason ? <p className="mt-1 text-slate-600 dark:text-slate-300">{event.reason}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <ConfirmModal open={editOpen} title={data ? 'Editar cuota anticipada' : 'Registrar cuota anticipada'} description="El límite permitido se consulta antes de registrar el monto." confirmLabel="Validar y guardar" isProcessing={isSaving} onCancel={() => setEditOpen(false)} onConfirm={() => void submitUpsert()}>
        <form className="space-y-3" onSubmit={submitUpsert}>
          <Field label="Monto *" error={upsertForm.formState.errors.amount?.message}>
            <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...upsertForm.register('amount')} />
          </Field>
          <Field label="Motivo" error={upsertForm.formState.errors.reason?.message}>
            <textarea rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...upsertForm.register('reason')} />
          </Field>
          <Field label="Notas" error={upsertForm.formState.errors.notes?.message}>
            <textarea rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...upsertForm.register('notes')} />
          </Field>
          {preview ? (
            <div className={`rounded-lg p-3 text-sm ${preview.isAllowed ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200'}`}>
              <p>{preview.message}</p>
              <p className="mt-1">Máximo permitido: {formatCurrency(preview.maxAllowedAmount)} · Fuente: {preview.limitSource} · Estrategia: {preview.limitStrategyCode}</p>
            </div>
          ) : null}
          {operationError ? <p className="text-sm text-red-600 dark:text-red-300">{operationError}</p> : null}
        </form>
      </ConfirmModal>

      <ConfirmModal open={cancelOpen} title="Cancelar cuota anticipada" description="La cuota permanecerá en el historial como cancelada. Debes registrar el motivo." confirmLabel="Cancelar cuota" isProcessing={isSaving} onCancel={() => setCancelOpen(false)} onConfirm={() => void submitCancellation()}>
        <form onSubmit={submitCancellation}>
          <Field label="Motivo *" error={cancelForm.formState.errors.reason?.message}>
            <textarea rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...cancelForm.register('reason')} />
          </Field>
          {operationError ? <p className="mt-2 text-sm text-red-600 dark:text-red-300">{operationError}</p> : null}
        </form>
      </ConfirmModal>
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block space-y-1 text-sm text-slate-700 dark:text-slate-200">
    <span className="font-medium">{label}</span>
    {children}
    {error ? <span className="block text-xs text-red-600 dark:text-red-300">{error}</span> : null}
  </label>
)
