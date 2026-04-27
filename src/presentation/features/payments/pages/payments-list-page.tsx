import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPaymentActionsAction } from '@/core/actions/payments/get-payment-actions.action'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { EffectivizePaymentModal } from '@/presentation/features/payments/components/effectivize-payment-modal'
import { ReversePaymentModal } from '@/presentation/features/payments/components/reverse-payment-modal'
import { PAYMENT_TYPE_OPTIONS } from '@/presentation/features/payments/components/payment-ui'
import { usePaymentMutations } from '@/presentation/features/payments/hooks/use-payment-mutations'
import { usePaymentSupportData } from '@/presentation/features/payments/hooks/use-payment-support-data'
import { usePaymentsList } from '@/presentation/features/payments/hooks/use-payments-list'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useNotifications } from '@/providers/NotificationProvider'
import { DatePicker } from '@/presentation/share/components/date-picker'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import SelectField from '@/presentation/share/components/select'
import { PaymentsTable } from '@/presentation/features/payments/components/payments-table'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'REGISTERED', label: 'Registrado' },
  { value: 'EFFECTIVIZED', label: 'Efectivizado' },
  { value: 'REVERSED', label: 'Reversado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  ...PAYMENT_TYPE_OPTIONS,
]

export const PaymentsListPage = () => {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.read')
  const payments = usePaymentsList(canRead)
  const supportData = usePaymentSupportData()
  const businessDate = useBusinessDate()
  const mutations = usePaymentMutations()

  const [loanCode, setLoanCode] = useState('')
  const [loanId, setLoanId] = useState<string | undefined>(undefined)
  const [clientOption, setClientOption] =
    useState<AsyncSelectOption<ClientListItem> | null>(null)
  const [channelId, setChannelId] = useState('')
  const [registeredByOption, setRegisteredByOption] =
    useState<AsyncSelectOption<SecurityUser> | null>(null)
  const [statusCode, setStatusCode] = useState('')
  const [paymentTypeCode, setPaymentTypeCode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rowActions, setRowActions] = useState<Record<string, PaymentActionsResponse>>({})
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null)
  const [effectivizeOpen, setEffectivizeOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)

  useEffect(() => {
    void supportData.loadChannels()
  }, [supportData.loadChannels])

  useEffect(() => {
    let ignore = false
    const loadActions = async () => {
      if (!canRead || !payments.items.length) {
        setRowActions({})
        return
      }

      const entries = await Promise.all(
        payments.items.map(async (payment) => {
          const result = await getPaymentActionsAction(payment.id)
          return [payment.id, result.success ? result.data : null] as const
        }),
      )
      if (ignore) return
      const nextActions: Record<string, PaymentActionsResponse> = {}
      entries.forEach(([paymentId, actions]) => {
        if (actions) nextActions[paymentId] = actions
      })
      setRowActions(nextActions)
    }
    void loadActions()
    return () => {
      ignore = true
    }
  }, [canRead, payments.items])

  const channelOptions = useMemo(
    () =>
      [
        { value: '', label: 'Todos' },
        ...supportData.channels.map((channel) => ({
          value: channel.id,
          label: channel.name,
          meta: channel,
        })),
      ] as Array<{ value: string; label: string; meta?: CollectionChannelResponse }>,
    [supportData.channels],
  )

  const loadClientOptions = async (inputValue: string) => {
    const results = await supportData.searchClients(inputValue)
    return results.map((client) => ({
      value: client.id,
      label: `${client.nombreCompleto} - ${client.identidad}`,
      meta: client,
    }))
  }

  const loadUserOptions = async (inputValue: string) => {
    const results = await supportData.searchUsers(inputValue)
    return results.map((user) => ({
      value: user.id,
      label: user.email,
      meta: user,
    }))
  }

  const handleSearch = async () => {
    let nextLoanId = loanId
    if (loanCode.trim()) {
      const loan = await supportData.findLoanByCode(loanCode.trim())
      if (!loan) {
        setLoanId(undefined)
        return
      }
      nextLoanId = loan.id
      setLoanId(loan.id)
      setLoanCode(loan.loanNo?.trim() || loanCode.trim().toUpperCase())
    } else {
      nextLoanId = undefined
      setLoanId(undefined)
    }

    payments.applyFilters({
      loanId: nextLoanId,
      clientId: clientOption?.value || undefined,
      collectionChannelId: channelId || undefined,
      registeredByUserId: registeredByOption?.value || undefined,
      statusCode: statusCode || undefined,
      paymentTypeCode: paymentTypeCode || undefined,
      from: from || undefined,
      to: to || undefined,
    })
  }

  const resetFilters = () => {
    setLoanCode('')
    setLoanId(undefined)
    setClientOption(null)
    setChannelId('')
    setRegisteredByOption(null)
    setStatusCode('')
    setPaymentTypeCode('')
    setFrom('')
    setTo('')
    payments.applyFilters({
      loanId: undefined,
      clientId: undefined,
      collectionChannelId: undefined,
      registeredByUserId: undefined,
      statusCode: undefined,
      paymentTypeCode: undefined,
      from: undefined,
      to: undefined,
    })
  }

  const getActionDisabledReason = (
    payment: PaymentResponse,
    code: 'effectivize' | 'reverse',
  ) => {
    const action = rowActions[payment.id]?.allowedActions.find((item) => item.code === code)
    if (action?.enabled) return null
    return action?.reason || 'Acción no disponible.'
  }

  const refreshAfterMutation = async () => {
    await Promise.all([payments.refresh(), businessDate.refresh()])
    setSelectedPayment(null)
  }

  const handleEffectivize = async (payment: PaymentResponse) => {
    mutations.setError(null)
    setSelectedPayment(payment)
    setEffectivizeOpen(true)
  }

  const handleReverse = async (payment: PaymentResponse) => {
    mutations.setError(null)
    setSelectedPayment(payment)
    setReverseOpen(true)
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar pagos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Consulta de pagos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Filtra pagos por préstamo, cliente, estado y rango de fechas.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={() => navigate('/payments/effectivization')}
        >
          Efectivización administrativa
        </button>
      </div>

      <ListFiltersBar
        layout="two-rows"
        search={loanCode}
        onSearchChange={setLoanCode}
        placeholder="Código del préstamo (búsqueda exacta)"
        status="all"
        onStatusChange={() => undefined}
        showStatus={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={resetFilters}>
              Limpiar filtros
            </button>
            <button type="button" className="btn-primary px-3 py-2 text-sm" onClick={() => void handleSearch()}>
              Buscar
            </button>
          </div>
        }
      >
        <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Cliente
            </label>
            <AsyncSelect<ClientListItem>
              value={clientOption}
              onChange={(option) => setClientOption(option)}
              loadOptions={loadClientOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingClients}
              inputId="payments-filter-client"
              instanceId="payments-filter-client"
              placeholder="Buscar cliente"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Canal
            </label>
            <SelectField
              inputId="payments-filter-channel"
              instanceId="payments-filter-channel"
              value={channelOptions.find((option) => option.value === channelId) ?? null}
              onChange={(option) => setChannelId(option?.value ?? '')}
              options={channelOptions}
              placeholder="Todos"
              isLoading={supportData.isLoadingChannels}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Usuario registrador
            </label>
            <AsyncSelect<SecurityUser>
              value={registeredByOption}
              onChange={(option) => setRegisteredByOption(option)}
              loadOptions={loadUserOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingUsers}
              inputId="payments-filter-user"
              instanceId="payments-filter-user"
              placeholder="Buscar usuario"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado
            </label>
            <SelectField
              inputId="payments-filter-status"
              instanceId="payments-filter-status"
              value={STATUS_OPTIONS.find((option) => option.value === statusCode) ?? null}
              onChange={(option) => setStatusCode(option?.value ?? '')}
              options={STATUS_OPTIONS}
              placeholder="Todos"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tipo de pago
            </label>
            <SelectField
              inputId="payments-filter-type"
              instanceId="payments-filter-type"
              value={
                PAYMENT_TYPE_FILTER_OPTIONS.find((option) => option.value === paymentTypeCode) ??
                null
              }
              onChange={(option) => setPaymentTypeCode(option?.value ?? '')}
              options={PAYMENT_TYPE_FILTER_OPTIONS}
              placeholder="Todos"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Desde
            </label>
            <DatePicker value={from} onChange={setFrom} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Hasta
            </label>
            <DatePicker value={to} onChange={setTo} />
          </div>
        </div>
      </ListFiltersBar>

      {supportData.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {supportData.error}
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <span>{payments.totalCount} pagos encontrados</span>
        <div className="flex items-center gap-2">
          <span>Registros por página</span>
          <select
            value={payments.pageSize}
            onChange={(event) => payments.setPageSize(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PaymentsTable
        items={payments.items}
        isLoading={payments.isLoading || isLoadingPermissions}
        error={payments.error}
        page={payments.page}
        totalPages={payments.totalPages}
        onPageChange={payments.setPage}
        onView={(payment) => navigate(`/payments/${payment.id}`)}
        actionsByPaymentId={rowActions}
        onEffectivize={handleEffectivize}
        onReverse={handleReverse}
      />

      <EffectivizePaymentModal
        open={effectivizeOpen}
        payment={selectedPayment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={
          selectedPayment ? getActionDisabledReason(selectedPayment, 'effectivize') : null
        }
        onClose={() => {
          mutations.setError(null)
          setEffectivizeOpen(false)
        }}
        onSubmit={async (payload) => {
          if (!selectedPayment) return false
          const disabledReason = getActionDisabledReason(selectedPayment, 'effectivize')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.effectivize(selectedPayment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await payments.refresh()
            return false
          }
          notify('Pago efectivizado correctamente.', 'success')
          await refreshAfterMutation()
          return true
        }}
      />

      <ReversePaymentModal
        open={reverseOpen}
        payment={selectedPayment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={
          selectedPayment ? getActionDisabledReason(selectedPayment, 'reverse') : null
        }
        onClose={() => {
          mutations.setError(null)
          setReverseOpen(false)
        }}
        onSubmit={async (payload) => {
          if (!selectedPayment) return false
          const disabledReason = getActionDisabledReason(selectedPayment, 'reverse')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.reverse(selectedPayment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await payments.refresh()
            return false
          }
          notify('Pago reversado correctamente.', 'success')
          await refreshAfterMutation()
          return true
        }}
      />
    </div>
  )
}
