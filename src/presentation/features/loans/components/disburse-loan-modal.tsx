import { useEffect, useRef, useState } from 'react'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { DisbursementChargesTable } from '@/presentation/features/loans/components/disbursement-charges-table'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import type { LoanSchedulePreviewDisbursementResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'

interface DisburseLoanModalProps {
  open: boolean
  application: LoanApplicationResponse
  previewDisbursement?: LoanSchedulePreviewDisbursementResponse | null
  isPreviewLoading?: boolean
  isProcessing?: boolean
  isSettlementLoading?: boolean
  onGenerateSettlement: () => void
  onCancel: () => void
  onConfirm: (notes: string | null) => Promise<void> | void
}

export const DisburseLoanModal = ({
  open,
  application,
  previewDisbursement = null,
  isPreviewLoading = false,
  isProcessing = false,
  isSettlementLoading = false,
  onGenerateSettlement,
  onCancel,
  onConfirm,
}: DisburseLoanModalProps) => {
  const [notes, setNotes] = useState('')
  const notesRef = useRef<HTMLTextAreaElement | null>(null)
  const isDisbursed =
    (application.statusCode ?? '').trim().toUpperCase() === 'DISBURSED' ||
    Boolean(application.disbursedOperationalDate)

  useEffect(() => {
    if (!open) {
      setNotes('')
    }
  }, [open])

  return (
    <ConfirmModal
      open={open}
      title="Confirmar desembolso"
      description={
        isDisbursed
          ? 'El desembolso se completó. Ya puedes generar y revisar la liquidación del préstamo.'
          : 'Revisa el resumen antes de desembolsar. La cuenta operativa de desembolso será determinada automáticamente por el sistema.'
      }
      confirmLabel="Confirmar desembolso"
      cancelLabel={isDisbursed ? 'Cerrar' : 'Cancelar'}
      panelClassName="max-w-4xl"
      isProcessing={isProcessing}
      confirmDisabled={isPreviewLoading}
      showConfirm={!isDisbursed}
      onCancel={onCancel}
      onConfirm={() => {
        void onConfirm(notes.trim() ? notes.trim() : null)
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
          <p className="text-sm text-sky-800 dark:text-sky-200">
            {isDisbursed
              ? 'La liquidación se genera con la información definitiva del préstamo desembolsado.'
              : 'La liquidación estará disponible después de confirmar el desembolso.'}
          </p>
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={onGenerateSettlement}
            disabled={!isDisbursed || isSettlementLoading || isProcessing}
          >
            {isSettlementLoading ? 'Generando liquidación...' : 'Generar liquidación'}
          </button>
        </div>

        <DisbursementSummaryCard
          title="Resumen del desembolso"
          emptyMessage="No hay cargos registrados; el sistema usará el capital aprobado como referencia para el desembolso."
          data={previewDisbursement ?? application}
        />

        {isPreviewLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Generando vista previa del desembolso...
          </div>
        ) : null}

        <DisbursementChargesTable
          charges={previewDisbursement?.charges ?? application.disbursementCharges}
        />

        {!isDisbursed ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Nota de flujo (opcional)
            </label>
            <textarea
              ref={notesRef}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Máximo 500 caracteres.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {notes.length}/500
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </ConfirmModal>
  )
}
