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
  suggestedAmount: number | null
  onPreview: (amount: number) => Promise<ApiResult<AnticipatedInstallmentLimitPreviewResponse>>
  onSave: (payload: UpsertAnticipatedInstallmentRequest) => Promise<ApiResult<AnticipatedInstallmentResponse>>
  onCancel: (payload: CancelAnticipatedInstallmentRequest) => Promise<ApiResult<AnticipatedInstallmentResponse>>
  onRefreshActions: () => Promise<void>
}

type UpsertMode = 'create' | 'edit' | 'reactivate'

export const LoanApplicationAnticipatedInstallmentSection = ({
  data,
  history,
  isLoading,
  isSaving,
  error,
  canManage,
  suggestedAmount,
  onPreview,
  onSave,
  onCancel,
  onRefreshActions,
}: Props) => {
  const [upsertMode, setUpsertMode] = useState<UpsertMode | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [preview, setPreview] = useState<AnticipatedInstallmentLimitPreviewResponse | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const isUpsertOpen = upsertMode !== null
  const statusCode = data?.statusCode?.trim().toUpperCase()
  const isPending = statusCode === 'PENDING'
  const isCancelled = statusCode === 'CANCELLED'
  const canCreate = !data && canManage
  const canEdit = Boolean(data && isPending && data.canModify)
  const canCancelPending = Boolean(data && isPending && data.canCancel)
  const canReactivate = Boolean(data && isCancelled && canManage)
  const upsertForm = useForm<AnticipatedInstallmentUpsertValues>({
    resolver: yupResolver(anticipatedInstallmentUpsertSchema),
    defaultValues: { amount: 0, reason: null, notes: null },
  })
  const cancelForm = useForm<AnticipatedInstallmentReasonValues>({
    resolver: yupResolver(anticipatedInstallmentReasonSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (!isUpsertOpen) return
    upsertForm.reset({
      amount: data?.currentAmount ?? suggestedAmount ?? 0,
      reason: null,
      notes: data?.notes ?? null,
    })
    setPreview(null)
    setOperationError(null)
  }, [data, isUpsertOpen, suggestedAmount, upsertForm])

  useEffect(() => {
    if (cancelOpen) {
      cancelForm.reset({ reason: '' })
      setOperationError(null)
    }
  }, [cancelForm, cancelOpen])

  const submitUpsert = upsertForm.handleSubmit(async (values) => {
    setOperationError(null)
    const reason = values.reason?.trim() || null
    if (upsertMode === 'reactivate' && !reason) {
      upsertForm.setError('reason', { message: 'Debes ingresar un motivo.' })
      return
    }
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
      reason,
      notes: values.notes?.trim() || null,
      idempotencyKey: createIdempotencyKey(),
    })
    if (!result.success) {
      setOperationError(result.error)
      if (result.status === 403) await onRefreshActions()
      return
    }
    setUpsertMode(null)
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

  const openUpsert = (mode: UpsertMode) => {
    setUpsertMode(mode)
  }

  const closeUpsert = () => {
    setUpsertMode(null)
  }

  const upsertTitle = upsertMode === 'reactivate'
    ? 'Reactivar cuota anticipada'
    : data
      ? 'Editar cuota anticipada'
      : 'Registrar cuota anticipada'
  const upsertDescription = upsertMode === 'reactivate'
    ? 'La cuota volverá a quedar pendiente y será considerada nuevamente en preview/desembolso.'
    : 'El límite permitido se consulta antes de registrar el monto.'
  const upsertConfirmLabel = upsertMode === 'reactivate' ? 'Validar y reactivar' : 'Validar y guardar'
  const amountLabel = upsertMode === 'reactivate' ? 'Nuevo monto *' : 'Monto *'
  const reasonLabel = upsertMode === 'reactivate' ? 'Motivo *' : 'Motivo'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cuota anticipada</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Monto registrado antes del desembolso y movimientos informados por el servidor.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {canCreate ? (
            <button type="button" className="btn-primary whitespace-nowrap px-2.5 py-1 text-xs" onClick={() => openUpsert('create')}>
              Registrar monto
            </button>
          ) : null}
          {canEdit ? (
            <button type="button" className="btn-primary whitespace-nowrap px-2.5 py-1 text-xs" onClick={() => openUpsert('edit')}>
              Editar monto
            </button>
          ) : null}
          {canReactivate ? (
            <button type="button" className="btn-primary whitespace-nowrap px-2.5 py-1 text-xs" onClick={() => openUpsert('reactivate')}>
              Reactivar cuota anticipada
            </button>
          ) : null}
          {canCancelPending ? (
            <button type="button" className="btn-secondary whitespace-nowrap px-2.5 py-1 text-xs" onClick={() => setCancelOpen(true)}>
              Cancelar cuota
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Consultando cuota anticipada...</p> : null}
      {error ? <p className="mt-3 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
      {!isLoading && !error && !data ? (
        <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Esta solicitud no tiene una cuota anticipada registrada.
        </p>
      ) : null}
      {data ? (
        <>
          <div className="mt-3 flex items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${anticipatedInstallmentStatusClass(data.statusCode)}`}>
              {anticipatedInstallmentStatusLabel(data.statusCode, data.statusName)}
            </span>
          </div>
          {isPending ? (
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              Cuota anticipada pendiente.
            </p>
          ) : null}
          {isCancelled ? (
            <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              Cuota anticipada cancelada. Puede reactivarse antes del desembolso si tiene permisos.
            </p>
          ) : null}
          <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="Monto original" value={formatCurrency(data.originalAmount)} />
            <Metric label="Monto actual" value={formatCurrency(data.currentAmount)} />
            <Metric label="Aplicado" value={formatCurrency(data.appliedAmount)} />
            <Metric label="Pendiente" value={formatCurrency(data.pendingAmount)} />
            <Metric label="Máximo permitido" value={data.maxAllowedAmountSnapshot == null ? '—' : formatCurrency(data.maxAllowedAmountSnapshot)} />
            <Metric label="Fecha de registro" value={formatAnticipatedInstallmentDate(data.createdBusinessDate)} />
          </div>
          {data.notes ? <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Notas: {data.notes}</p> : null}
        </>
      ) : null}
      {data ? (
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historial</h3>
          {!history.length ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">No hay eventos registrados.</p> : (
            <div className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {history.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-1.5 px-2.5 py-1.5 text-xs md:grid-cols-[minmax(0,1.1fr)_8rem_8rem_minmax(0,1.6fr)] md:items-center"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {anticipatedInstallmentEventLabel(event.eventCode)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatAnticipatedInstallmentDate(event.businessDate)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">
                    {event.newAmount == null ? 'Sin monto' : formatCurrency(event.newAmount)}
                  </span>
                  <span className="truncate text-slate-600 dark:text-slate-300" title={event.reason ?? undefined}>
                    {event.reason?.trim() || 'Sin motivo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <ConfirmModal open={isUpsertOpen} title={upsertTitle} description={upsertDescription} confirmLabel={upsertConfirmLabel} isProcessing={isSaving} onCancel={closeUpsert} onConfirm={() => void submitUpsert()}>
        <form className="space-y-3" onSubmit={submitUpsert}>
          <Field label={amountLabel} error={upsertForm.formState.errors.amount?.message}>
            <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...upsertForm.register('amount')} />
          </Field>
          <Field label={reasonLabel} error={upsertForm.formState.errors.reason?.message}>
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

      <ConfirmModal open={cancelOpen} title="Cancelar cuota anticipada" description="La cuota quedará cancelada y no será descontada en el desembolso mientras permanezca en estado cancelado." confirmLabel="Cancelar cuota" isProcessing={isSaving} onCancel={() => setCancelOpen(false)} onConfirm={() => void submitCancellation()}>
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

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `frontend-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block space-y-1 text-sm text-slate-700 dark:text-slate-200">
    <span className="font-medium">{label}</span>
    {children}
    {error ? <span className="block text-xs text-red-600 dark:text-red-300">{error}</span> : null}
  </label>
)
