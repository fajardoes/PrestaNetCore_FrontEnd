import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { formatCurrency, formatDate, translatePaymentStatus } from './payment-ui'

interface EffectivizePaymentModalProps {
  open: boolean
  payment: PaymentResponse | null
  businessDate?: string
  isSubmitting?: boolean
  backendError?: string | null
  disabledReason?: string | null
  onClose: () => void
  onSubmit: (payload: EffectivizePaymentRequest) => Promise<boolean>
}

const toDate = (value?: string | null) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

const accountLabel = (account: ChartAccountListItem) =>
  `${account.code?.trim() || 'Sin código'} - ${account.name?.trim() || 'Sin nombre'}`

const toAccountOption = (
  account: ChartAccountListItem,
): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: accountLabel(account),
  meta: account,
})

export const EffectivizePaymentModal = ({
  open,
  payment,
  businessDate,
  isSubmitting,
  backendError,
  disabledReason,
  onClose,
  onSubmit,
}: EffectivizePaymentModalProps) => {
  const { searchAccounts, isLoading, error } = useGlAccountsSearch()
  const [bankAccount, setBankAccount] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const [effectivizationDate, setEffectivizationDate] = useState('')
  const [bankReferenceNumber, setBankReferenceNumber] = useState('')
  const [bankDepositDate, setBankDepositDate] = useState('')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setBankAccount(null)
    setEffectivizationDate(businessDate || payment?.businessDate || '')
    setBankReferenceNumber('')
    setBankDepositDate('')
    setNotes('')
    setValidationError(null)
  }, [businessDate, open, payment?.businessDate])

  const loadAccountOptions = useCallback(
    async (inputValue: string) => {
      const results = await searchAccounts(inputValue.trim())
      return results
        .filter((account) => account.isActive && !account.isGroup)
        .map(toAccountOption)
    },
    [searchAccounts],
  )

  const maxDate = useMemo(
    () => toDate(businessDate || payment?.businessDate),
    [businessDate, payment?.businessDate],
  )

  const validate = () => {
    if (!bankAccount?.value) return 'Selecciona la cuenta contable de banco.'
    if (!effectivizationDate) return 'Selecciona la fecha de efectivización.'
    if (businessDate && effectivizationDate > businessDate) {
      return 'La fecha de efectivización no puede ser mayor que la fecha operativa.'
    }
    if (bankReferenceNumber.trim().length > 100) {
      return 'La referencia bancaria no puede superar 100 caracteres.'
    }
    return null
  }

  const handleConfirm = async () => {
    const message = validate()
    if (message) {
      setValidationError(message)
      return
    }
    if (!bankAccount?.value) return

    const ok = await onSubmit({
      bankGlAccountId: bankAccount.value,
      effectivizationDate,
      bankReferenceNumber: bankReferenceNumber.trim() || null,
      bankDepositDate: bankDepositDate || null,
      notes: notes.trim() || null,
    })
    if (ok) onClose()
  }

  if (!payment) return null

  return (
    <ConfirmModal
      open={open}
      title="Efectivizar pago"
      description="Confirma el depósito administrativo y selecciona la cuenta de banco que recibirá el traslado contable."
      confirmLabel="Efectivizar"
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

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Resumen contable informativo
          </p>
          <div className="mt-2 grid gap-2 text-slate-700 dark:text-slate-200 md:grid-cols-3">
            <span>DR Banco seleccionado</span>
            <span>CR Recaudación en tránsito</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Cuenta banco
            </label>
            <AsyncSelect<ChartAccountListItem>
              value={bankAccount}
              onChange={(option) => setBankAccount(option)}
              loadOptions={loadAccountOptions}
              defaultOptions
              isClearable
              isDisabled={isSubmitting}
              isLoading={isLoading}
              inputId="effectivize-bank-account"
              instanceId="effectivize-bank-account"
              placeholder="Buscar cuenta contable activa e imputable"
              noOptionsMessage="No hay cuentas imputables activas."
            />
          </div>

          <Field label="Fecha operativa vigente" value={formatDate(businessDate)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha de efectivización
            </label>
            <DatePicker
              value={effectivizationDate}
              onChange={setEffectivizationDate}
              maxDate={maxDate}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Referencia bancaria
            </label>
            <input
              value={bankReferenceNumber}
              onChange={(event) => setBankReferenceNumber(event.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha de depósito
            </label>
            <DatePicker
              value={bankDepositDate}
              onChange={setBankDepositDate}
              allowFutureDates
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {disabledReason || validationError || backendError || error ? (
          <p className="text-sm text-red-600 dark:text-red-300">
            {disabledReason || validationError || backendError || error}
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

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {value}
    </p>
  </div>
)
