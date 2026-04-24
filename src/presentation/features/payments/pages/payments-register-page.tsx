import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'
import type { PaymentTypeCode } from '@/infrastructure/payments/requests/register-payment-request'
import type { PaymentRegistrationFormValues } from '@/infrastructure/validations/payments/payment-registration.schema'
import { paymentRegistrationSchema } from '@/infrastructure/validations/payments/payment-registration.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { PaymentReceiptModal } from '@/presentation/features/payments/components/payment-receipt-modal'
import {
  PAYMENT_TYPE_OPTIONS,
  formatCurrency,
  formatDate,
  translatePaymentType,
} from '@/presentation/features/payments/components/payment-ui'
import { usePaymentRegistration } from '@/presentation/features/payments/hooks/use-payment-registration'
import { usePaymentSupportData } from '@/presentation/features/payments/hooks/use-payment-support-data'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useCollectionTransitAccount } from '@/presentation/features/system-collection-transit-account/hooks/use-collection-transit-account'
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

  const { state: businessDateState, isLoading: isLoadingBusinessDate, error: businessDateError } =
    useBusinessDate()
  const {
    state: transitState,
    isLoading: isLoadingTransit,
    error: transitError,
  } = useCollectionTransitAccount()
  const paymentSupport = usePaymentSupportData()
  const paymentRegistration = usePaymentRegistration()

  const [loanCode, setLoanCode] = useState('')
  const [selectedLoan, setSelectedLoan] = useState<LoanResponse | null>(null)
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

  const isLoanEligible =
    selectedLoan?.statusCode?.trim().toUpperCase() === 'ACTIVE' &&
    !selectedLoan?.isDisbursementReversed
  const isDayOpen = businessDateState?.isDayOpen ?? false
  const transitBlockingState = Boolean(
    transitState && (!transitState.isConfigured || !transitState.isValid),
  )
  const shouldBlockSubmit =
    !selectedLoan ||
    !isLoanEligible ||
    !isDayOpen ||
    paymentRegistration.isSubmitting ||
    isLoadingBusinessDate ||
    isLoadingTransit ||
    transitBlockingState

  const handleResolveLoan = async () => {
    const normalizedLoanCode = loanCode.trim()
    if (!normalizedLoanCode) return
    const result = await paymentSupport.findLoanByCode(normalizedLoanCode)
    if (!result) {
      setSelectedLoan(null)
      return
    }
    setSelectedLoan(result)
  }

  const handlePaymentTypeChange = (value?: string) => {
    setValue('paymentTypeCode', isPaymentTypeCode(value) ? value : 'CASH', {
      shouldValidate: true,
    })
  }

  const onSubmit = handleSubmit(async (values) => {
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
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Resolver préstamo
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ingresa el código visible del préstamo. El sistema no permite registrar pagos sobre préstamos no activos o con desembolso revertido.
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={loanCode}
              onChange={(event) => setLoanCode(event.target.value.toUpperCase())}
              placeholder="PRE-2026-000123"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            />
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleResolveLoan()}
              disabled={!loanCode.trim() || paymentSupport.isLoadingLoan}
            >
              {paymentSupport.isLoadingLoan ? 'Buscando...' : 'Buscar préstamo'}
            </button>
          </div>
          {paymentSupport.error ? (
            <p className="text-sm text-red-600 dark:text-red-300">{paymentSupport.error}</p>
          ) : null}
        </div>

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
                {selectedLoan.clientFullName?.trim() || '—'}
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
          </div>
        ) : null}

        {selectedLoan && !isLoanEligible ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {selectedLoan.isDisbursementReversed
              ? 'No se pueden registrar pagos sobre un préstamo con desembolso revertido.'
              : 'Solo se pueden registrar pagos sobre préstamos activos.'}
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
    </div>
  )
}
