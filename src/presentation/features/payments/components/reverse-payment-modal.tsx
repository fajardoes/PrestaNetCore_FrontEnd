import { useEffect, useMemo, useState } from 'react'
import type { ReversePaymentRequest } from '@/infrastructure/payments/requests/reverse-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { formatCurrency, formatDate, translatePaymentStatus } from './payment-ui'

interface ReversePaymentModalProps {
  open: boolean
  payment: PaymentResponse | null
  businessDate?: string
  isSubmitting?: boolean
  backendError?: string | null
  disabledReason?: string | null
  onClose: () => void
  onSubmit: (payload: ReversePaymentRequest) => Promise<boolean>
}

const toDate = (value?: string | null) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export const ReversePaymentModal = ({
  open,
  payment,
  businessDate,
  isSubmitting,
  backendError,
  disabledReason,
  onClose,
  onSubmit,
}: ReversePaymentModalProps) => {
  const [reversalDate, setReversalDate] = useState('')
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReversalDate(businessDate || payment?.businessDate || '')
    setReason('')
    setValidationError(null)
  }, [businessDate, open, payment?.businessDate])

  const maxDate = useMemo(
    () => toDate(businessDate || payment?.businessDate),
    [businessDate, payment?.businessDate],
  )

  const warning = useMemo(() => {
    const status = payment?.statusCode?.trim().toUpperCase()
    if (status === 'EFFECTIVIZED') {
      return 'Se revertirá el cronograma, el asiento de efectivización y el asiento de registro. La exposición no se modificará porque ya fue liberada.'
    }
    return 'Se revertirá el cronograma, el asiento de registro y se liberará exposición pendiente.'
  }, [payment?.statusCode])

  const validate = () => {
    if (!reversalDate) return 'Selecciona la fecha de reversa.'
    if (businessDate && reversalDate > businessDate) {
      return 'La fecha de reversa no puede ser mayor que la fecha operativa.'
    }
    if (!reason.trim()) return 'Ingresa el motivo de la reversa.'
    if (reason.trim().length > 500) return 'El motivo no puede superar 500 caracteres.'
    return null
  }

  const handleConfirm = async () => {
    const message = validate()
    if (message) {
      setValidationError(message)
      return
    }

    const ok = await onSubmit({
      reversalDate,
      reason: reason.trim(),
    })
    if (ok) onClose()
  }

  if (!payment) return null

  return (
    <ConfirmModal
      open={open}
      title="Reversar pago"
      description="Confirma esta acción sensible. El backend generará los movimientos de reversa correspondientes."
      confirmLabel="Reversar"
      cancelLabel="Cancelar"
      panelClassName="max-w-3xl"
      isProcessing={isSubmitting}
      confirmDisabled={Boolean(disabledReason)}
      onCancel={onClose}
      onConfirm={() => void handleConfirm()}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Summary label="Recibo" value={payment.internalReceiptNumber || '—'} />
          <Summary label="Cliente" value={payment.clientFullName || '—'} />
          <Summary label="Préstamo" value={payment.loanNo || '—'} />
          <Summary label="Canal" value={payment.collectionChannelName || '—'} />
          <Summary label="Monto" value={formatCurrency(payment.amount)} />
          <Summary
            label="Estado"
            value={translatePaymentStatus(payment.statusCode, payment.statusName)}
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
          {warning}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha operativa vigente
            </p>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {formatDate(businessDate)}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha de reversa
            </label>
            <DatePicker
              value={reversalDate}
              onChange={setReversalDate}
              maxDate={maxDate}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
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
