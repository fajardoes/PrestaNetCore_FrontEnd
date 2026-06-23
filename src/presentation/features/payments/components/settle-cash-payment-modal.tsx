import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { formatCurrency, translatePaymentStatus } from './payment-ui'

interface SettleCashPaymentModalProps {
  open: boolean
  payment: PaymentResponse | null
  isSubmitting?: boolean
  backendError?: string | null
  disabledReason?: string | null
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export const SettleCashPaymentModal = ({
  open,
  payment,
  isSubmitting,
  backendError,
  disabledReason,
  onClose,
  onConfirm,
}: SettleCashPaymentModalProps) => {
  if (!payment) return null

  return (
    <ConfirmModal
      open={open}
      title="Liquidar efectivo"
      description="Confirma la liquidación por caja. El backend liberará la exposición del canal y del usuario asignado."
      confirmLabel="Liquidar"
      cancelLabel="Cancelar"
      isProcessing={isSubmitting}
      confirmDisabled={Boolean(disabledReason)}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm().then((ok) => {
          if (ok) onClose()
        })
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Summary label="Cliente" value={payment.clientFullName || '—'} />
          <Summary label="Préstamo" value={payment.loanNo || '—'} />
          <Summary label="Canal" value={payment.collectionChannelName || '—'} />
          <Summary label="Monto" value={formatCurrency(payment.amount)} />
          <Summary
            label="Estado"
            value={translatePaymentStatus(payment.statusCode, payment.statusName)}
          />
          <Summary label="Recibo" value={payment.internalReceiptNumber || '—'} />
        </div>
        {disabledReason || backendError ? (
          <p className="text-sm text-red-600 dark:text-red-300">
            {disabledReason || backendError}
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
