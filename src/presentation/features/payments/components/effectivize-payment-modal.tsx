import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import { useBankEntityCatalog } from '@/presentation/features/payments/hooks/use-bank-entity-catalog'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'
import {
  formatBankEntityDisplay,
  formatCurrency,
  formatDate,
  translatePaymentStatus,
} from './payment-ui'

export interface EffectivizePaymentFormValues {
  bankGlAccountId?: string | null
  bankEntityId?: string | null
  effectivizationDate: string
  bankReferenceNumber?: string | null
  bankDepositDate?: string | null
  notes?: string | null
}

interface EffectivizePaymentModalProps {
  open: boolean
  payment: PaymentResponse | null
  businessDate?: string
  isSubmitting?: boolean
  backendError?: string | null
  disabledReason?: string | null
  onClose: () => void
  onSubmit: (payload: EffectivizePaymentFormValues) => Promise<boolean>
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

const toBankEntityOption = (
  entity: BankEntityResponse,
): SelectOption<BankEntityResponse> => ({
  value: entity.id,
  label: formatBankEntityDisplay(entity.code, entity.name),
  meta: entity,
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
  const { searchAccounts, isLoading: isLoadingAccounts, error: accountError } =
    useGlAccountsSearch()
  const {
    loadBankEntities,
    getBankEntityById,
    isLoading: isLoadingBankEntities,
    error: bankEntitiesError,
  } = useBankEntityCatalog()
  const [bankAccount, setBankAccount] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const [bankEntity, setBankEntity] = useState<SelectOption<BankEntityResponse> | null>(null)
  const [bankEntityOptions, setBankEntityOptions] = useState<SelectOption<BankEntityResponse>[]>([])
  const [effectivizationDate, setEffectivizationDate] = useState('')
  const [bankReferenceNumber, setBankReferenceNumber] = useState('')
  const [bankDepositDate, setBankDepositDate] = useState('')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const isBankProof = payment?.paymentFlowCode?.trim().toUpperCase() === 'BANK_PROOF'

  useEffect(() => {
    if (!open) return
    setBankAccount(null)
    setBankEntity(null)
    setBankEntityOptions([])
    setEffectivizationDate(businessDate || payment?.businessDate || '')
    setBankReferenceNumber(
      payment?.reportedBankReferenceNumber || payment?.bankReferenceNumber || '',
    )
    setBankDepositDate(payment?.reportedBankDepositDate || payment?.bankDepositDate || '')
    setNotes('')
    setValidationError(null)
  }, [
    businessDate,
    open,
    payment?.bankDepositDate,
    payment?.bankReferenceNumber,
    payment?.businessDate,
    payment?.reportedBankDepositDate,
    payment?.reportedBankReferenceNumber,
  ])

  useEffect(() => {
    if (!open || !isBankProof) return
    let ignore = false
    const fetchBankEntities = async () => {
      const entities = await loadBankEntities({ isActive: true })
      if (ignore) return

      const options = entities.map(toBankEntityOption)
      setBankEntityOptions(options)

      const preselectedId =
        payment?.approvedBankEntityId?.trim() || payment?.reportedBankEntityId?.trim() || ''
      if (!preselectedId) return

      const match = options.find((option) => option.value === preselectedId)
      if (match) {
        setBankEntity(match)
        return
      }

      const entity = await getBankEntityById(preselectedId)
      if (ignore || !entity) return

      const option = toBankEntityOption(entity)
      setBankEntityOptions((current) =>
        current.some((item) => item.value === option.value) ? current : [...current, option],
      )
      setBankEntity(option)
    }

    void fetchBankEntities()
    return () => {
      ignore = true
    }
  }, [
    getBankEntityById,
    isBankProof,
    loadBankEntities,
    open,
    payment?.approvedBankEntityId,
    payment?.reportedBankEntityId,
  ])

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
    if (isBankProof) {
      if (!bankEntity?.value) return 'Selecciona la entidad bancaria confirmada.'
    } else if (!bankAccount?.value) {
      return 'Selecciona la cuenta contable de banco.'
    }

    if (!effectivizationDate) return 'Selecciona la fecha de efectivización.'
    if (businessDate && effectivizationDate > businessDate) {
      return 'La fecha de efectivización no puede ser mayor que la fecha operativa.'
    }
    if (bankReferenceNumber.trim().length > 100) {
      return 'La referencia bancaria no puede superar 100 caracteres.'
    }
    if (businessDate && bankDepositDate && bankDepositDate > businessDate) {
      return 'La fecha de depósito no puede ser mayor que la fecha operativa.'
    }
    if (notes.trim().length > 500) {
      return 'Las notas no pueden superar 500 caracteres.'
    }
    return null
  }

  const handleConfirm = async () => {
    const message = validate()
    if (message) {
      setValidationError(message)
      return
    }

    const ok = await onSubmit({
      bankGlAccountId: bankAccount?.value || null,
      bankEntityId: bankEntity?.value || null,
      effectivizationDate,
      bankReferenceNumber: bankReferenceNumber.trim() || null,
      bankDepositDate: bankDepositDate || null,
      notes: notes.trim() || null,
    })
    if (ok) onClose()
  }

  if (!payment) return null

  const reportedBankLabel = payment.reportedBankEntityId
    ? formatBankEntityDisplay(
        payment.reportedBankEntityCode,
        payment.reportedBankEntityName,
        'Banco sin nombre',
      )
    : 'Banco no especificado por capturista'
  const confirmedBankLabel =
    bankEntity?.label ||
    (payment.approvedBankEntityId
      ? formatBankEntityDisplay(payment.approvedBankEntityCode, payment.approvedBankEntityName)
      : '')
  const reportedBankId = payment.reportedBankEntityId?.trim() || ''
  const confirmedBankId = bankEntity?.value?.trim() || payment.approvedBankEntityId?.trim() || ''
  const bankChanged = Boolean(reportedBankId && confirmedBankId && reportedBankId !== confirmedBankId)

  return (
    <ConfirmModal
      open={open}
      title={isBankProof ? 'Aprobar abono bancario' : 'Efectivizar pago'}
      description={
        isBankProof
          ? 'Confirma la entidad bancaria conciliada. El backend resolverá la cuenta contable, aplicará el pago y generará el recibo interno.'
          : 'Confirma el depósito administrativo y selecciona la cuenta de banco que recibirá el traslado contable.'
      }
      confirmLabel={isBankProof ? 'Aprobar' : 'Efectivizar'}
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
            {isBankProof ? 'Resumen de aprobación' : 'Resumen contable informativo'}
          </p>
          <div className="mt-2 grid gap-2 text-slate-700 dark:text-slate-200 md:grid-cols-3">
            {isBankProof ? (
              <>
                <span>Banco confirmado por revisión</span>
                <span>Cuenta contable resuelta en backend</span>
                <span>{formatCurrency(payment.amount)}</span>
              </>
            ) : (
              <>
                <span>DR Banco seleccionado</span>
                <span>CR Recaudación en tránsito</span>
                <span>{formatCurrency(payment.amount)}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {isBankProof ? (
            <>
              <Field label="Banco reportado" value={reportedBankLabel} />
              <Field label="Fecha operativa vigente" value={formatDate(businessDate)} />
              <Field
                label="Referencia reportada"
                value={payment.reportedBankReferenceNumber?.trim() || '—'}
              />
              <Field
                label="Fecha reportada"
                value={formatDate(payment.reportedBankDepositDate)}
              />
              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Entidad bancaria confirmada
                  </label>
                  {payment.reportedBankEntityId ? (
                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100">
                      Banco sugerido por registro
                    </span>
                  ) : null}
                </div>
                <SelectField<BankEntityResponse>
                  value={bankEntity}
                  onChange={(option) => setBankEntity(option)}
                  options={bankEntityOptions}
                  isClearable
                  isDisabled={isSubmitting || isLoadingBankEntities}
                  isLoading={isLoadingBankEntities}
                  inputId="approve-bank-proof-bank-entity"
                  instanceId="approve-bank-proof-bank-entity"
                  placeholder="Selecciona el banco conciliado"
                  noOptionsMessage="No hay entidades bancarias activas."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {confirmedBankLabel
                    ? `Banco confirmado: ${confirmedBankLabel}`
                    : 'Debes seleccionar una entidad bancaria para aprobar.'}
                </p>
              </div>
              {bankChanged ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50 md:col-span-2">
                  El banco confirmado difiere del banco reportado en el registro.
                </div>
              ) : null}
            </>
          ) : (
            <>
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
                  isLoading={isLoadingAccounts}
                  inputId="effectivize-bank-account"
                  instanceId="effectivize-bank-account"
                  placeholder="Buscar cuenta contable activa e imputable"
                  noOptionsMessage="No hay cuentas imputables activas."
                />
              </div>
              <Field label="Fecha operativa vigente" value={formatDate(businessDate)} />
            </>
          )}

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
              {isBankProof ? 'Referencia bancaria verificada' : 'Referencia bancaria'}
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
              {isBankProof ? 'Fecha de depósito verificada' : 'Fecha de depósito'}
            </label>
            <DatePicker
              value={bankDepositDate}
              onChange={setBankDepositDate}
              maxDate={maxDate}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {isBankProof ? 'Notas de revisión' : 'Notas'}
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {disabledReason || validationError || backendError || accountError || bankEntitiesError ? (
          <p className="text-sm text-red-600 dark:text-red-300">
            {disabledReason ||
              validationError ||
              backendError ||
              accountError ||
              bankEntitiesError}
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
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
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
