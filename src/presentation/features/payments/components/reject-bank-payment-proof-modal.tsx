import { useEffect, useState } from 'react'
import type { RejectBankPaymentProofRequest } from '@/infrastructure/payments/requests/reject-bank-payment-proof-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { formatCurrency, translatePaymentStatus } from './payment-ui'

interface RejectBankPaymentProofModalProps {
  open: boolean
  payment: PaymentResponse | null
  isSubmitting?: boolean
  backendError?: string | null
  disabledReason?: string | null
  onClose: () => void
  onSubmit: (payload: RejectBankPaymentProofRequest) => Promise<boolean>
}

export const RejectBankPaymentProofModal = ({
  open,
  payment,
  isSubmitting,
  backendError,
  disabledReason,
  onClose,
  onSubmit,
}: RejectBankPaymentProofModalProps) => {
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setValidationError(null)
  }, [open])

  const handleConfirm = async () => {
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setValidationError('Ingresa el motivo del rechazo.')
      return
    }
    if (trimmedReason.length > 500) {
      setValidationError('El motivo no puede superar 500 caracteres.')
      return
    }

    const ok = await onSubmit({ reason: trimmedReason })
    if (ok) onClose()
  }

  if (!payment) return null

  return (
    <ConfirmModal
      open={open}
      title="Rechazar abono bancario"
      description="Confirma el rechazo del comprobante pendiente. No se aplicará al préstamo ni generará recibo interno."
      confirmLabel="Rechazar"
      cancelLabel="Cancelar"
      panelClassName="max-w-2xl"
      isProcessing={isSubmitting}
      confirmDisabled={Boolean(disabledReason)}
      onCancel={onClose}
      onConfirm={() => void handleConfirm()}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Summary label="Cliente" value={payment.clientFullName || '—'} />
          <Summary label="Préstamo" value={payment.loanNo || '—'} />
          <Summary label="Monto" value={formatCurrency(payment.amount)} />
          <Summary
            label="Estado"
            value={translatePaymentStatus(payment.statusCode, payment.statusName)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Motivo
          </label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            disabled={isSubmitting}
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        {disabledReason || validationError || backendError ? (
          <p className="text-sm text-red-600 dark:text-red-300">
            {disabledReason || validationError || backendError}
          </p>
        ) : null}
      </div>
    </ConfirmModal>
  )
}

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)
