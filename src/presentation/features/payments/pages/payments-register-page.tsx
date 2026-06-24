import { useEffect, useState } from 'react'
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Registro de pagos en efectivo
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra efectivo cobrado por cobradores usando la fecha operativa y la asignación activa del usuario.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fecha operativa
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              {isLoadingBusinessDate ? 'Cargando...' : formatDate(businessDateState?.businessDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado del día
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              {isLoadingBusinessDate ? 'Cargando...' : isDayOpen ? 'Abierto' : 'Cerrado'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Flujo operativo
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              Pago en efectivo
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Canal
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              Resuelto por backend
            </p>
          </div>
        </div>

        {businessDateError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {businessDateError}
          </div>
        ) : null}

        {!isDayOpen && !isLoadingBusinessDate ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            El día operativo está cerrado. No se puede registrar pagos mientras la fecha operativa no esté abierta.
          </div>
        ) : null}

        {!isLoadingPermissions && !canOperateCollectionChannels ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            Debes contar con permisos de operación de canales de recaudo para guardar pagos.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Resolver préstamo
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Busca un cliente o escribe el número visible del préstamo. El registro solo queda disponible para préstamos vigentes, morosos o vencidos.
          </p>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
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

          {lookupError ? (
            <p className="text-sm text-red-600 dark:text-red-300">{lookupError}</p>
          ) : null}
          {lookup && lookup.loans.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
              No se encontraron préstamos disponibles para la consulta.
            </div>
          ) : null}
        </div>

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
            Solo se pueden registrar pagos sobre préstamos vigentes, morosos o vencidos.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Captura del pago</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          El canal, usuario asignado, fecha y tipo CASH los define backend. No se envían datos bancarios desde esta pantalla.
        </p>

        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="payment-notes"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Notas
              </label>
              <textarea
                id="payment-notes"
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={paymentRegistration.isSubmitting}
                {...register('notes')}
              />
              {errors.notes ? <p className="text-xs text-red-500">{errors.notes.message}</p> : null}
            </div>
          </div>

          {paymentRegistration.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {paymentRegistration.error}
            </div>
          ) : null}

          <div className="flex justify-end">
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
