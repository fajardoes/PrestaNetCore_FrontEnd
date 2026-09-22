import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { PaymentLookupLoanResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import type { PaymentRegistrationFormValues } from '@/infrastructure/validations/payments/payment-registration.schema'
import { paymentRegistrationSchema } from '@/infrastructure/validations/payments/payment-registration.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { LoanClientPickerModal } from '@/presentation/features/loans/loans-query/components/loan-client-picker-modal'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import {
  formatDate,
} from '@/presentation/features/payments/components/payment-ui'
import {
  PaymentLookupLoanSelector,
  PaymentLookupLoanSummaryCard,
} from '@/presentation/features/payments/components/payment-lookup-summary'
import { usePaymentLookup } from '@/presentation/features/payments/hooks/use-payment-lookup'
import { usePaymentReceiptReport } from '@/presentation/features/payments/hooks/use-payment-receipt-report'
import { usePaymentRegistration } from '@/presentation/features/payments/hooks/use-payment-registration'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'

const defaultValues: PaymentRegistrationFormValues = {
  amount: 0,
  referenceNumber: '',
  externalReceiptNumber: '',
  notes: '',
}

const COLLECTABLE_LOAN_STATUSES = new Set(['ACTIVE', 'DELINQUENT', 'MATURED'])

export const PaymentsRegisterPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRegister = hasPermission('cash_collections.payments.register')
  const canOperateCollectionChannels = hasPermission('collection_channels.operate')

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
  const receiptReport = usePaymentReceiptReport()

  const [loanCode, setLoanCode] = useState('')
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientSearchPage, setClientSearchPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState<LoanClientSearchItemResponse | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<PaymentLookupLoanResponse | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentRegistrationFormValues>({
    resolver: zodResolver(paymentRegistrationSchema),
    defaultValues,
  })

  const isLoanEligible = selectedLoan
    ? COLLECTABLE_LOAN_STATUSES.has(selectedLoan.statusCode?.trim().toUpperCase() ?? '')
    : false
  const isDayOpen = businessDateState?.isDayOpen ?? false
  const shouldBlockSubmit =
    !selectedLoan ||
    !isLoanEligible ||
    !isDayOpen ||
    !canOperateCollectionChannels ||
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
    if (!result.success) {
      return
    }
    setSelectedLoan(result.data.loans[0] ?? null)
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

  const onSubmit = handleSubmit(async (values) => {
    if (!canOperateCollectionChannels) {
      paymentRegistration.setError(
        'Debes contar con permisos de operación de canales de recaudo para guardar pagos.',
      )
      return
    }

    if (!selectedLoan) {
      paymentRegistration.setError('Debes resolver un préstamo antes de registrar el pago.')
      return
    }

    const result = await paymentRegistration.submitCashCollection({
      loanId: selectedLoan.id,
      amount: values.amount,
      referenceNumber: values.referenceNumber?.trim() || null,
      externalReceiptNumber: values.externalReceiptNumber?.trim() || null,
      notes: values.notes?.trim() || null,
    })

    if (!result.success) {
      notify(result.error, 'error')
      return
    }

    notify('Pago registrado correctamente.', 'success')
    const receiptResult = await receiptReport.openReceipt(result.data.id)
    if (!receiptResult.success) notify(receiptResult.error, 'error')
    reset(defaultValues)
    setLoanCode(result.data.loanNo?.trim() || '')
  })

  if (!isLoadingPermissions && !canRegister) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Debes contar con permisos de registro de pagos para usar esta pantalla.
        </p>
      </div>
    )
  }

  const handleChangeLoan = () => {
    setSelectedClient(null)
    setSelectedLoan(null)
    setLoanCode('')
    clearLookup()
  }

  return (
    <div className="space-y-3 pb-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Registro de pagos en efectivo
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra efectivo cobrado por cobradores usando la fecha operativa y la asignación activa del usuario.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid divide-y divide-slate-200 md:grid-cols-[minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_minmax(11rem,1fr)_minmax(11rem,1fr)] md:divide-x md:divide-y-0 dark:divide-slate-800">
          <ContextItem
            label="Fecha operativa"
            value={isLoadingBusinessDate ? 'Cargando...' : formatDate(businessDateState?.businessDate)}
          />
          <ContextItem
            label="Estado del día"
            value={
              isLoadingBusinessDate ? (
                'Cargando...'
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDayOpen ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    aria-hidden="true"
                  />
                  {isDayOpen ? 'Abierto' : 'Cerrado'}
                </span>
              )
            }
          />
          <ContextItem label="Flujo operativo" value="Pago en efectivo" />
          <ContextItem label="Canal" value="Resuelto por backend" />
        </div>

        {businessDateError ? (
          <div className="mt-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {businessDateError}
          </div>
        ) : null}

        {!isDayOpen && !isLoadingBusinessDate ? (
          <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            El día operativo está cerrado. No se puede registrar pagos mientras la fecha operativa no esté abierta.
          </div>
        ) : null}

        {!isLoadingPermissions && !canOperateCollectionChannels ? (
          <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            Debes contar con permisos de operación de canales de recaudo para guardar pagos.
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {selectedLoan ? (
          <PaymentLookupLoanSummaryCard
            businessDate={lookup?.businessDate ?? businessDateState?.businessDate}
            clientName={lookup?.client?.fullName ?? selectedClient?.clientFullName}
            clientIdentityNo={lookup?.client?.identityNo ?? selectedClient?.clientIdentityNo}
            loan={selectedLoan}
            compact
            onChange={handleChangeLoan}
          />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            <div className="min-w-0 md:border-r md:border-slate-200 md:pr-4 md:dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Buscar por cliente
              </p>
              <p className="mt-0 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                Selecciona un cliente para consultar sus préstamos disponibles.
              </p>
              <div className="mt-1.5 flex min-h-9 flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-primary px-3 py-1.5 text-sm"
                  onClick={() => setClientPickerOpen(true)}
                >
                  Buscar cliente
                </button>
                {selectedClient ? (
                  <span className="min-w-0 truncate text-xs text-slate-600 dark:text-slate-300">
                    {selectedClient.clientFullName} · <HnIdentityText value={selectedClient.clientIdentityNo} fallback="—" />
                  </span>
                ) : null}
                {selectedClient || lookup ? (
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={handleChangeLoan}
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
            </div>

            <div className="min-w-0 md:pl-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Buscar por número de préstamo
              </p>
              <p className="mt-0 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                Usa el número visible en el comprobante o contrato.
              </p>
              <div className="mt-1.5 flex gap-2">
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <button
                  type="button"
                  className="btn-primary shrink-0 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void handleResolveLoan()}
                  disabled={!loanCode.trim() || isLookingUp}
                >
                  {isLookingUp ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {lookupError ? <p className="mt-1.5 text-sm text-red-600 dark:text-red-300">{lookupError}</p> : null}
        {lookup && lookup.loans.length === 0 ? (
          <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
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
            compact
          />
        ) : null}

        {selectedLoan && !isLoanEligible ? (
          <div className="mt-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            Solo se pueden registrar pagos sobre préstamos vigentes, morosos o vencidos.
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Captura del pago</h2>
        <p className="mt-0 text-[11px] leading-4 text-slate-600 dark:text-slate-400">
          El canal, usuario asignado, fecha y tipo CASH los define backend. No se envían datos bancarios desde esta pantalla.
        </p>

        <form className="mt-2 space-y-2" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="payment-amount"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Monto
              </label>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={paymentRegistration.isSubmitting}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount ? <p className="text-xs text-red-500">{errors.amount.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="payment-reference"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Referencia
              </label>
              <input
                id="payment-reference"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={paymentRegistration.isSubmitting}
                {...register('referenceNumber')}
              />
              {errors.referenceNumber ? (
                <p className="text-xs text-red-500">{errors.referenceNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="payment-external-receipt"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Recibo externo
              </label>
              <input
                id="payment-external-receipt"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={paymentRegistration.isSubmitting}
                {...register('externalReceiptNumber')}
              />
              {errors.externalReceiptNumber ? (
                <p className="text-xs text-red-500">{errors.externalReceiptNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label
                htmlFor="payment-notes"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Notas
              </label>
              <textarea
                id="payment-notes"
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={paymentRegistration.isSubmitting}
                {...register('notes')}
              />
              {errors.notes ? <p className="text-xs text-red-500">{errors.notes.message}</p> : null}
            </div>
          </div>

          {paymentRegistration.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {paymentRegistration.error}
            </div>
          ) : null}

          <div className="sticky bottom-3 z-10 -mx-3 flex flex-col gap-1.5 border-t border-slate-200 bg-white/95 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950/95 sm:flex-row sm:items-center sm:justify-between">
            {selectedLoan ? (
              <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                Préstamo <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedLoan.loanNo?.trim() || selectedLoan.id}</span>
              </p>
            ) : null}
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={shouldBlockSubmit}
            >
              {paymentRegistration.isSubmitting ? 'Registrando pago...' : 'Registrar pago'}
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

const ContextItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0 px-1 py-1.5 first:pl-0 last:pr-0 md:px-4 md:py-1 md:first:pl-0 md:last:pr-0">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
  </div>
)
