import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { FileText, Upload } from 'lucide-react'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { PaymentLookupLoanResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import { useNotifications } from '@/providers/NotificationProvider'
import { LoanClientPickerModal } from '@/presentation/features/loans/loans-query/components/loan-client-picker-modal'
import {
  PaymentLookupLoanSelector,
  PaymentLookupLoanSummaryCard,
} from '@/presentation/features/payments/components/payment-lookup-summary'
import { formatDate } from '@/presentation/features/payments/components/payment-ui'
import { useBankEntityCatalog } from '@/presentation/features/payments/hooks/use-bank-entity-catalog'
import { usePaymentLookup } from '@/presentation/features/payments/hooks/use-payment-lookup'
import { usePaymentRegistration } from '@/presentation/features/payments/hooks/use-payment-registration'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { MessageModal } from '@/presentation/share/components/message-modal'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

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
  const {
    loadBankEntities,
    isLoading: isLoadingBankEntities,
    error: bankEntitiesError,
  } = useBankEntityCatalog()

  const [loanCode, setLoanCode] = useState('')
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientSearchPage, setClientSearchPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState<LoanClientSearchItemResponse | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<PaymentLookupLoanResponse | null>(null)
  const [amount, setAmount] = useState('')
  const [bankReferenceNumber, setBankReferenceNumber] = useState('')
  const [bankDepositDate, setBankDepositDate] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofFileInputKey, setProofFileInputKey] = useState(0)
  const [externalReceiptNumber, setExternalReceiptNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [bankEntityOption, setBankEntityOption] =
    useState<SelectOption<BankEntityResponse> | null>(null)
  const [bankEntityOptions, setBankEntityOptions] = useState<SelectOption<BankEntityResponse>[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const isLoanEligible = selectedLoan
    ? COLLECTABLE_LOAN_STATUSES.has(selectedLoan.statusCode?.trim().toUpperCase() ?? '')
    : false
  const isDayOpen = businessDateState?.isDayOpen ?? false
  const submitBlockReason = isLoadingPermissions
    ? 'Se están cargando los permisos del usuario.'
    : isLoadingBusinessDate
      ? 'Se está validando la fecha operativa del sistema.'
      : !selectedLoan
        ? lookup && lookup.loans.length > 1
          ? 'Debes seleccionar un préstamo de la lista antes de registrar el abono.'
          : 'Debes resolver un préstamo antes de registrar el abono.'
        : !isLoanEligible
          ? 'Solo se pueden registrar abonos sobre préstamos vigentes, morosos o vencidos.'
          : !isDayOpen
            ? 'El día operativo está cerrado.'
            : null
  const shouldBlockSubmit =
    Boolean(submitBlockReason) || paymentRegistration.isSubmitting

  useEffect(() => {
    if (!clientPickerOpen) return
    void searchClients(clientSearch, clientSearchPage)
  }, [clientPickerOpen, clientSearch, clientSearchPage, searchClients])

  useEffect(() => {
    let ignore = false
    const fetchBankEntities = async () => {
      const entities = await loadBankEntities({ isActive: true })
      if (ignore) return
      setBankEntityOptions(
        entities.map((entity) => ({
          value: entity.id,
          label: `${entity.code} - ${entity.name}`,
          meta: entity,
        })),
      )
    }
    void fetchBankEntities()
    return () => {
      ignore = true
    }
  }, [loadBankEntities])

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
    if (!proofFile) return 'Adjunta el archivo del comprobante bancario.'
    if (externalReceiptNumber.trim().length > 80) {
      return 'El comprobante externo no puede superar 80 caracteres.'
    }
    if (notes.trim().length > 500) return 'Las notas no pueden superar 500 caracteres.'
    return null
  }

  const clearScreen = () => {
    setLoanCode('')
    setSelectedClient(null)
    setSelectedLoan(null)
    setAmount('')
    setBankReferenceNumber('')
    setBankDepositDate('')
    setProofFile(null)
    setProofFileInputKey((current) => current + 1)
    setExternalReceiptNumber('')
    setNotes('')
    setBankEntityOption(null)
    setValidationError(null)
    clearLookup()
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validate()
    if (message) {
      setValidationError(message)
      return
    }
    if (!selectedLoan || !proofFile) return

    const result = await paymentRegistration.submitBankProof({
      loanId: selectedLoan.id,
      bankEntityId: bankEntityOption?.value || null,
      amount: Number(amount),
      bankReferenceNumber: bankReferenceNumber.trim(),
      bankDepositDate,
      proofFile,
      externalReceiptNumber: externalReceiptNumber.trim() || null,
      notes: notes.trim() || null,
    })

    if (!result.success) {
      notify(result.error, 'error')
      return
    }

    setValidationError(null)
    setSuccessOpen(true)
  }

  const handleProofFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProofFile(event.target.files?.[0] ?? null)
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
            <Field label="Entidad bancaria">
              <SelectField<BankEntityResponse>
                value={bankEntityOption}
                onChange={(option) => setBankEntityOption(option)}
                options={bankEntityOptions}
                isClearable
                isDisabled={paymentRegistration.isSubmitting || isLoadingBankEntities}
                isLoading={isLoadingBankEntities}
                inputId="bank-proof-bank-entity"
                instanceId="bank-proof-bank-entity"
                placeholder="Selecciona el banco reportado por el cliente"
                noOptionsMessage="No hay entidades bancarias activas."
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {bankEntityOption
                  ? 'El banco seleccionado se enviará para revisión.'
                  : 'Banco no especificado.'}
              </p>
            </Field>
            <Field label="Archivo del comprobante">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 transition hover:border-primary/70 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-primary/70 dark:hover:bg-primary/10">
                <input
                  key={proofFileInputKey}
                  id="bank-proof-file"
                  type="file"
                  onChange={handleProofFileChange}
                  disabled={paymentRegistration.isSubmitting}
                  className="sr-only"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                      {proofFile ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {proofFile ? 'Comprobante seleccionado' : 'Subir comprobante bancario'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {proofFile
                          ? 'Puedes cambiar el archivo antes de registrar el abono.'
                          : 'Haz clic en el botón para adjuntar el comprobante emitido por el banco.'}
                      </p>
                    </div>
                  </div>
                  <label
                    htmlFor="bank-proof-file"
                    className={`btn-secondary inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm ${
                      paymentRegistration.isSubmitting
                        ? 'pointer-events-none cursor-not-allowed opacity-60'
                        : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {proofFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                  </label>
                </div>
              </div>
              {proofFile ? (
                <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {proofFile.name}
                  </span>
                  <span className="mx-1">·</span>
                  <span>{formatFileSize(proofFile.size)}</span>
                  <span className="mx-1">·</span>
                  <span>{proofFile.type || 'Tipo no identificado'}</span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  El archivo es obligatorio para enviar el abono a revisión.
                </p>
              )}
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
          {!validationError && !paymentRegistration.error && bankEntitiesError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
              {bankEntitiesError}
            </div>
          ) : null}
          {!validationError && !paymentRegistration.error && !bankEntitiesError && submitBlockReason ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
              {submitBlockReason}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={shouldBlockSubmit}
              title={submitBlockReason ?? undefined}
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
      <MessageModal
        open={successOpen}
        title="Abono registrado"
        description="El abono bancario fue registrado correctamente y quedó pendiente de revisión."
        tone="success"
        acknowledgeLabel="OK"
        onAcknowledge={() => {
          setSuccessOpen(false)
          clearScreen()
        }}
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

const formatFileSize = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}
