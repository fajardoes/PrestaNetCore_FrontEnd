import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { PaymentLookupLoanResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import type { PaymentTypeCode } from '@/infrastructure/payments/requests/register-payment-request'
import { useNotifications } from '@/providers/NotificationProvider'
import { LoanClientPickerModal } from '@/presentation/features/loans/loans-query/components/loan-client-picker-modal'
import {
  PaymentLookupLoanSelector,
  PaymentLookupLoanSummaryCard,
} from '@/presentation/features/payments/components/payment-lookup-summary'
import {
  BANK_PAYMENT_TYPE_OPTIONS,
  formatDate,
} from '@/presentation/features/payments/components/payment-ui'
import { usePaymentLookup } from '@/presentation/features/payments/hooks/use-payment-lookup'
import { usePaymentRegistration } from '@/presentation/features/payments/hooks/use-payment-registration'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField from '@/presentation/share/components/select'

type BankProofTypeCode = Exclude<PaymentTypeCode, 'CASH'>

const bankTypeOptions = BANK_PAYMENT_TYPE_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))

const COLLECTABLE_LOAN_STATUSES = new Set(['ACTIVE', 'DELINQUENT', 'MATURED'])

const toDate = (value?: string | null) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export const BankPaymentProofRegisterPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRegister = hasPermission('bank_payment_proofs.register')
  const { state: businessDateState, isLoading: isLoadingBusinessDate, error: businessDateError } =
    useBusinessDate()
  const {
    lookup,
    isLookingUp,
    lookupError,
    clientSearchResults,
    clientSearchTotalPages,
    clientSearchLoading,
    clientSearchError,
    lookupByLoanNo,
    lookupByClientIdentity,
    searchClients,
    clearLookup,
  } = usePaymentLookup()
  const paymentRegistration = usePaymentRegistration()

  const [loanCode, setLoanCode] = useState('')
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientSearchPage, setClientSearchPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState<LoanClientSearchItemResponse | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<PaymentLookupLoanResponse | null>(null)
  const [paymentTypeCode, setPaymentTypeCode] =
    useState<BankProofTypeCode>('BANK_TRANSFER_PROOF')
  const [amount, setAmount] = useState('')
  const [bankReferenceNumber, setBankReferenceNumber] = useState('')
  const [bankDepositDate, setBankDepositDate] = useState('')
  const [bankDepositProofUrl, setBankDepositProofUrl] = useState('')
  const [externalReceiptNumber, setExternalReceiptNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const isLoanEligible = selectedLoan
    ? COLLECTABLE_LOAN_STATUSES.has(selectedLoan.statusCode?.trim().toUpperCase() ?? '')
    : false
  const isDayOpen = businessDateState?.isDayOpen ?? false
  const shouldBlockSubmit =
    !selectedLoan ||
    !isLoanEligible ||
    !isDayOpen ||
    paymentRegistration.isSubmitting ||
    isLoadingPermissions ||
    isLoadingBusinessDate

  useEffect(() => {
    if (!clientPickerOpen) return
    void searchClients(clientSearch, clientSearchPage)
  }, [clientPickerOpen, clientSearch, clientSearchPage, searchClients])

  const handleResolveLoan = async () => {
    const normalizedLoanCode = loanCode.trim()
    if (!normalizedLoanCode) return
    setSelectedClient(null)
    setSelectedLoan(null)
    const result = await lookupByLoanNo(normalizedLoanCode)
    if (result.success) setSelectedLoan(result.data.loans[0] ?? null)
  }

  const handleSelectClient = async (client: LoanClientSearchItemResponse) => {
    setSelectedClient(client)
    setClientPickerOpen(false)
    setLoanCode('')
    setSelectedLoan(null)

    const identityNo = client.clientIdentityNo?.trim()
    if (!identityNo) {
      notify('El cliente seleccionado no tiene identidad disponible.', 'error')
      return
    }

    const result = await lookupByClientIdentity(identityNo)
    if (result.success && result.data.loans.length === 1) {
      setSelectedLoan(result.data.loans[0])
    }
  }

  const validate = () => {
    const parsedAmount = Number(amount)
    if (!selectedLoan) return 'Debes resolver un préstamo antes de registrar el abono.'
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return 'El monto debe ser mayor que cero.'
    }
    if (!bankReferenceNumber.trim()) return 'La referencia bancaria es obligatoria.'
    if (bankReferenceNumber.trim().length > 100) {
      return 'La referencia bancaria no puede superar 100 caracteres.'
    }
    if (!bankDepositDate) return 'La fecha de depósito o transferencia es obligatoria.'
    if (businessDateState?.businessDate && bankDepositDate > businessDateState.businessDate) {
      return 'La fecha de depósito no puede ser mayor que la fecha operativa.'
    }
    if (externalReceiptNumber.trim().length > 80) {
      return 'El comprobante externo no puede superar 80 caracteres.'
    }
    if (notes.trim().length > 500) return 'Las notas no pueden superar 500 caracteres.'
    return null
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validate()
    if (message) {
      setValidationError(message)
      return
    }
    if (!selectedLoan) return

    const result = await paymentRegistration.submitBankProof({
      loanId: selectedLoan.id,
      paymentTypeCode,
      amount: Number(amount),
      bankReferenceNumber: bankReferenceNumber.trim(),
      bankDepositDate,
      bankDepositProofUrl: bankDepositProofUrl.trim() || null,
      externalReceiptNumber: externalReceiptNumber.trim() || null,
      notes: notes.trim() || null,
    })

    if (!result.success) {
      notify(result.error, 'error')
      return
    }

    notify('Abono bancario registrado para revisión.', 'success')
    setAmount('')
    setBankReferenceNumber('')
    setBankDepositDate('')
    setBankDepositProofUrl('')
    setExternalReceiptNumber('')
    setNotes('')
    setValidationError(null)
    setLoanCode(result.data.loanNo?.trim() || '')
  }

  if (!isLoadingPermissions && !canRegister) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Debes contar con permisos de registro de abonos bancarios.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Registrar abono bancario
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra comprobantes con referencia bancaria para revisión. No aplica al préstamo ni genera recibo interno hasta su aprobación.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-3 md:grid-cols-3">
          <InfoCard label="Fecha operativa" value={isLoadingBusinessDate ? 'Cargando...' : formatDate(businessDateState?.businessDate)} />
          <InfoCard label="Estado del día" value={isLoadingBusinessDate ? 'Cargando...' : isDayOpen ? 'Abierto' : 'Cerrado'} />
          <InfoCard label="Flujo operativo" value="Abono bancario con comprobante" />
        </div>
        {businessDateError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {businessDateError}
          </div>
        ) : null}
        {!isDayOpen && !isLoadingBusinessDate ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            El día operativo está cerrado. No se pueden registrar abonos bancarios.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Buscar por cliente
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Selecciona un cliente y se consultarán sus préstamos disponibles para pago.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:min-w-[10rem] sm:items-stretch">
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={() => setClientPickerOpen(true)}
                >
                  Buscar cliente
                </button>
                {selectedClient || lookup || selectedLoan ? (
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 text-sm"
                    onClick={() => {
                      setSelectedClient(null)
                      setSelectedLoan(null)
                      setLoanCode('')
                      clearLookup()
                    }}
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
            </div>
            {selectedClient ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedClient.clientFullName}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  <HnIdentityText value={selectedClient.clientIdentityNo} fallback="—" />
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Buscar por número de préstamo
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={loanCode}
                onChange={(event) => setLoanCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleResolveLoan()
                  }
                }}
                placeholder="PRE-2026-000001"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void handleResolveLoan()}
                disabled={!loanCode.trim() || isLookingUp}
              >
                {isLookingUp ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {lookupError ? <p className="mt-3 text-sm text-red-600 dark:text-red-300">{lookupError}</p> : null}
        {lookup && lookup.loans.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            No se encontraron préstamos disponibles para la consulta.
          </div>
        ) : null}

        {lookup && lookup.loans.length > 1 ? (
          <PaymentLookupLoanSelector
            businessDate={lookup.businessDate ?? businessDateState?.businessDate}
            client={lookup.client}
            loans={lookup.loans}
            selectedLoanId={selectedLoan?.id}
            onSelect={setSelectedLoan}
          />
        ) : null}

        {selectedLoan ? (
          <PaymentLookupLoanSummaryCard
            businessDate={lookup?.businessDate ?? businessDateState?.businessDate}
            clientName={lookup?.client?.fullName ?? selectedClient?.clientFullName}
            clientIdentityNo={lookup?.client?.identityNo ?? selectedClient?.clientIdentityNo}
            loan={selectedLoan}
          />
        ) : null}

        {selectedLoan && !isLoanEligible ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            Solo se pueden registrar abonos sobre préstamos vigentes, morosos o vencidos.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Datos del comprobante
        </h2>
        <form className="mt-4 space-y-4" onSubmit={(event) => void submit(event)} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tipo de abono">
              <SelectField
                inputId="bank-proof-type"
                instanceId="bank-proof-type"
                value={bankTypeOptions.find((option) => option.value === paymentTypeCode) ?? null}
                onChange={(option) => {
                  const next = option?.value
                  if (next && next !== 'CASH') setPaymentTypeCode(next as BankProofTypeCode)
                }}
                options={bankTypeOptions}
                isDisabled={paymentRegistration.isSubmitting}
              />
            </Field>
            <Field label="Monto">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={paymentRegistration.isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>
            <Field label="Referencia bancaria">
              <input
                type="text"
                maxLength={100}
                value={bankReferenceNumber}
                onChange={(event) => setBankReferenceNumber(event.target.value)}
                disabled={paymentRegistration.isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>
            <Field label="Fecha de depósito o transferencia">
              <DatePicker
                value={bankDepositDate}
                onChange={setBankDepositDate}
                maxDate={toDate(businessDateState?.businessDate)}
                disabled={paymentRegistration.isSubmitting}
              />
            </Field>
            <Field label="Metadata o URL del comprobante">
              <input
                type="text"
                value={bankDepositProofUrl}
                onChange={(event) => setBankDepositProofUrl(event.target.value)}
                disabled={paymentRegistration.isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>
            <Field label="Comprobante externo">
              <input
                type="text"
                maxLength={80}
                value={externalReceiptNumber}
                onChange={(event) => setExternalReceiptNumber(event.target.value)}
                disabled={paymentRegistration.isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Notas
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={paymentRegistration.isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {validationError || paymentRegistration.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {validationError || paymentRegistration.error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={shouldBlockSubmit}
            >
              {paymentRegistration.isSubmitting ? 'Registrando abono...' : 'Registrar abono'}
            </button>
          </div>
        </form>
      </section>

      <LoanClientPickerModal
        open={clientPickerOpen}
        clients={clientSearchResults}
        search={clientSearch}
        page={clientSearchPage}
        totalPages={clientSearchTotalPages}
        isLoading={clientSearchLoading}
        error={clientSearchError}
        selectedClientId={selectedClient?.id}
        onSearchChange={(value) => {
          setClientSearch(value)
          setClientSearchPage(1)
        }}
        onPageChange={setClientSearchPage}
        onSelect={(client) => {
          void handleSelectClient(client)
        }}
        onClose={() => setClientPickerOpen(false)}
      />
    </div>
  )
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
  </div>
)

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </label>
    {children}
  </div>
)
