import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { PaymentTypeCode } from '@/infrastructure/payments/requests/register-payment-request'
import type { PaymentLookupLoanResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import type { PaymentRegistrationFormValues } from '@/infrastructure/validations/payments/payment-registration.schema'
import { paymentRegistrationSchema } from '@/infrastructure/validations/payments/payment-registration.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { LoanClientPickerModal } from '@/presentation/features/loans/loans-query/components/loan-client-picker-modal'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { PaymentReceiptModal } from '@/presentation/features/payments/components/payment-receipt-modal'
import {
  PAYMENT_TYPE_OPTIONS,
  formatCurrency,
  formatDate,
  translatePaymentType,
} from '@/presentation/features/payments/components/payment-ui'
import { usePaymentLookup } from '@/presentation/features/payments/hooks/use-payment-lookup'
import { usePaymentRegistration } from '@/presentation/features/payments/hooks/use-payment-registration'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useCollectionTransitAccount } from '@/presentation/features/system-collection-transit-account/hooks/use-collection-transit-account'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import SelectField from '@/presentation/share/components/select'
import { translateLoanApplicationStatus } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

const defaultValues: PaymentRegistrationFormValues = {
  paymentTypeCode: 'CASH',
  amount: 0,
  referenceNumber: '',
  externalReceiptNumber: '',
  notes: '',
}

const paymentTypeOptions = PAYMENT_TYPE_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))

const isPaymentTypeCode = (value?: string): value is PaymentTypeCode =>
  PAYMENT_TYPE_OPTIONS.some((item) => item.value === value)

export const PaymentsRegisterPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRegister = hasPermission('payments.register')
  const canOperateCollectionChannels = hasPermission('collection_channels.operate')

  const { state: businessDateState, isLoading: isLoadingBusinessDate, error: businessDateError } =
    useBusinessDate()
  const {
    state: transitState,
    isLoading: isLoadingTransit,
    error: transitError,
  } = useCollectionTransitAccount()
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
  const [showReceipt, setShowReceipt] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentRegistrationFormValues>({
    resolver: zodResolver(paymentRegistrationSchema),
    defaultValues,
  })

  const isLoanEligible = selectedLoan?.statusCode?.trim().toUpperCase() === 'ACTIVE'
  const isDayOpen = businessDateState?.isDayOpen ?? false
  const transitBlockingState = Boolean(
    transitState && (!transitState.isConfigured || !transitState.isValid),
  )
  const shouldBlockSubmit =
    !selectedLoan ||
    !isLoanEligible ||
    !isDayOpen ||
    !canOperateCollectionChannels ||
    paymentRegistration.isSubmitting ||
    isLoadingPermissions ||
    isLoadingBusinessDate ||
    isLoadingTransit ||
    transitBlockingState

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

  const handlePaymentTypeChange = (value?: string) => {
    setValue('paymentTypeCode', isPaymentTypeCode(value) ? value : 'CASH', {
      shouldValidate: true,
    })
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

    const result = await paymentRegistration.submit({
      loanId: selectedLoan.id,
      paymentTypeCode: values.paymentTypeCode,
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
    setShowReceipt(true)
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
          Registro operativo de pagos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra pagos sobre préstamos activos usando la fecha operativa entregada por backend.
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
              Cuenta transitoria
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              {isLoadingTransit
                ? 'Validando...'
                : transitState?.isConfigured
                  ? transitState.collectionTransitGlAccountCode || 'Configurada'
                  : 'Sin configurar'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado de referencia
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              {isLoadingTransit
                ? 'Validando...'
                : !transitState
                  ? 'No disponible'
                  : transitState.isValid
                    ? 'Válida'
                    : 'Inválida'}
            </p>
          </div>
        </div>

        {businessDateError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {businessDateError}
          </div>
        ) : null}

        {transitError ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
            No fue posible validar la cuenta transitoria antes del registro: {transitError}
          </div>
        ) : null}

        {transitBlockingState ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            <p className="font-semibold">Registro bloqueado</p>
            <p className="mt-1">
              {!transitState?.isConfigured
                ? 'No está configurada la cuenta transitoria de recaudo.'
                : transitState.validationMessage || 'La cuenta transitoria configurada no es válida.'}
            </p>
            <Link
              to="/admin/system/collection-transit-account"
              className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Revisar configuración administrativa
            </Link>
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
            Busca un cliente o escribe el número visible del préstamo. El registro solo queda disponible para préstamos activos.
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
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-3 flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Selecciona el préstamo a pagar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                El cliente tiene más de un préstamo disponible en la consulta.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {lookup.loans.map((loan) => {
                const isSelected = selectedLoan?.id === loan.id
                return (
                  <button
                    key={loan.id}
                    type="button"
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20 dark:border-primary/70 dark:bg-primary/20'
                        : 'border-slate-200 bg-white hover:border-primary/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-primary/60'
                    }`}
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {loan.loanNo?.trim() || loan.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {loan.loanProductName || 'Producto no especificado'}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {translateLoanApplicationStatus(loan.statusCode, loan.statusName)}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                      <span>Saldo: {formatCurrency(loan.totalOutstanding)}</span>
                      <span>
                        Próxima cuota:{' '}
                        {formatCurrency(loan.nextPayableInstallment?.outstandingAmount)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {selectedLoan ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Préstamo
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {selectedLoan.loanNo?.trim() || '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cliente
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {lookup?.client?.fullName?.trim() || selectedClient?.clientFullName?.trim() || '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estado
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {translateLoanApplicationStatus(selectedLoan.statusCode, selectedLoan.statusName)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Capital
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {formatCurrency(selectedLoan.principal)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Saldo pendiente
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {formatCurrency(selectedLoan.totalOutstanding)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Próxima cuota
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {selectedLoan.nextPayableInstallment
                  ? `#${selectedLoan.nextPayableInstallment.installmentNo} · ${formatCurrency(
                      selectedLoan.nextPayableInstallment.outstandingAmount,
                    )}`
                  : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Vencimiento
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
                {formatDate(selectedLoan.nextPayableInstallment?.dueDateAdjusted)}
              </p>
            </div>
          </div>
        ) : null}

        {selectedLoan && !isLoanEligible ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            Solo se pueden registrar pagos sobre préstamos activos.
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Captura del pago</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          La fecha y el canal del pago los define backend usando la fecha operativa y tu asignación activa.
        </p>

        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de pago
              </label>
              <SelectField
                inputId="payment-type"
                instanceId="payment-type"
                value={
                  paymentTypeOptions.find((option) => option.value === watch('paymentTypeCode')) ?? null
                }
                onChange={(option) => handlePaymentTypeChange(option?.value)}
                options={paymentTypeOptions}
                isDisabled={paymentRegistration.isSubmitting}
                placeholder="Selecciona el tipo"
              />
              {errors.paymentTypeCode ? (
                <p className="text-xs text-red-500">{errors.paymentTypeCode.message}</p>
              ) : null}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translatePaymentType(watch('paymentTypeCode'))}
              </p>
            </div>

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

      <PaymentReceiptModal
        open={showReceipt}
        payment={paymentRegistration.lastPayment}
        onClose={() => setShowReceipt(false)}
      />

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
