import { useEffect, useState } from 'react'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import type { DailyClosingActionKind } from './daily-closing-actions-panel'
import { formatDateOnly } from './daily-closing-ui'

interface DailyClosingRunActionModalProps {
  open: boolean
  actionKind: DailyClosingActionKind | null
  status: DailyLoanClosingStatusResponse | null
  isProcessing?: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: (payload: {
    notes: string | null
    closeBusinessDayOnSuccess: boolean
  }) => void
}

export const DailyClosingRunActionModal = ({
  open,
  actionKind,
  status,
  isProcessing,
  error,
  onCancel,
  onConfirm,
}: DailyClosingRunActionModalProps) => {
  const [notes, setNotes] = useState('')
  const [closeBusinessDayOnSuccess, setCloseBusinessDayOnSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      setNotes('')
      setCloseBusinessDayOnSuccess(false)
    }
  }, [open])

  const isDryRun = actionKind === 'dry-run'
  const isReprocess = actionKind === 'reprocess'
  const title = isDryRun
    ? 'Simular cierre diario'
    : isReprocess
      ? 'Reprocesar cierre diario'
      : 'Ejecutar cierre diario'
  const confirmLabel = isDryRun
    ? 'Simular cierre'
    : isReprocess
      ? 'Reprocesar'
      : 'Ejecutar cierre'

  return (
    <ConfirmModal
      open={open}
      title={title}
      description="La fecha operativa se toma del estado vigente y no puede editarse manualmente."
      confirmLabel={confirmLabel}
      isProcessing={isProcessing}
      confirmDisabled={!status}
      panelClassName="max-w-2xl"
      onCancel={onCancel}
      onConfirm={() =>
        onConfirm({
          notes: notes.trim() || null,
          closeBusinessDayOnSuccess: isDryRun ? false : closeBusinessDayOnSuccess,
        })
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha operativa
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {formatDateOnly(status?.businessDate)}
          </p>
        </div>

        {isDryRun ? (
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100">
            La simulacion registra run, detalles y eventos de calculo, pero no aplica
            devengos, cargos diferidos, mora, snapshots ni cambios de estado.
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            Esta accion ejecuta el cierre real para la fecha operativa vigente.
            Revise los bloqueos y advertencias antes de confirmar.
          </div>
        )}

        {!isDryRun ? (
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
              checked={closeBusinessDayOnSuccess}
              onChange={(event) => setCloseBusinessDayOnSuccess(event.target.checked)}
            />
            <span>Cerrar dia operativo si el cierre finaliza exitosamente.</span>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Notas
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Notas operativas opcionales"
            disabled={isProcessing}
          />
        </label>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </ConfirmModal>
  )
}
