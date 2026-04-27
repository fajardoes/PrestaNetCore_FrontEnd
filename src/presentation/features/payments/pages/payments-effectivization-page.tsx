import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, RotateCcw } from 'lucide-react'
import { effectivizePaymentAction } from '@/core/actions/payments/effectivize-payment.action'
import { getPaymentActionsAction } from '@/core/actions/payments/get-payment-actions.action'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import { BulkEffectivizePaymentsModal } from '@/presentation/features/payments/components/bulk-effectivize-payments-modal'
import { usePaymentSupportData } from '@/presentation/features/payments/hooks/use-payment-support-data'
import { usePaymentsList } from '@/presentation/features/payments/hooks/use-payments-list'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useNotifications } from '@/providers/NotificationProvider'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import SelectField from '@/presentation/share/components/select'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { formatCurrency, formatDate, translatePaymentType } from '@/presentation/features/payments/components/payment-ui'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

type BulkResult = {
  payment: PaymentResponse
  ok: boolean
  message: string
}

export const PaymentsEffectivizationPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.read')
  const canEffectivize = hasPermission('payments.effectivize')
  const payments = usePaymentsList(canRead, { statusCode: 'REGISTERED' })
  const supportData = usePaymentSupportData()
  const businessDate = useBusinessDate()

  const [loanCode, setLoanCode] = useState('')
  const [loanId, setLoanId] = useState<string | undefined>(undefined)
  const [clientOption, setClientOption] =
    useState<AsyncSelectOption<ClientListItem> | null>(null)
  const [channelId, setChannelId] = useState('')
  const [registeredByOption, setRegisteredByOption] =
    useState<AsyncSelectOption<SecurityUser> | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rowActions, setRowActions] = useState<Record<string, PaymentActionsResponse>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastResults, setLastResults] = useState<BulkResult[]>([])

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

  useEffect(() => {
    setSelectedIds((prev) => {
      const visibleIds = new Set(payments.items.map((payment) => payment.id))
      return new Set(Array.from(prev).filter((id) => visibleIds.has(id)))
    })
  }, [payments.items])

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

  const selectedPayments = useMemo(
    () => payments.items.filter((payment) => selectedIds.has(payment.id)),
    [payments.items, selectedIds],
  )

  const eligiblePayments = useMemo(
    () =>
      payments.items.filter((payment) =>
        rowActions[payment.id]?.allowedActions.some(
          (action) => action.code === 'effectivize' && action.enabled,
        ),
      ),
    [payments.items, rowActions],
  )

  const visibleRegisteredTotal = useMemo(
    () => payments.items.reduce((sum, payment) => sum + payment.amount, 0),
    [payments.items],
  )

  const selectedTotal = useMemo(
    () => selectedPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [selectedPayments],
  )

  const selectedByChannel = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number; count: number }>()
    selectedPayments.forEach((payment) => {
      const key = payment.collectionChannelId || payment.collectionChannelName || 'unknown'
      const current = totals.get(key) ?? {
        name: payment.collectionChannelName || 'Sin canal',
        amount: 0,
        count: 0,
      }
      current.amount += payment.amount
      current.count += 1
      totals.set(key, current)
    })
    return Array.from(totals.values())
  }, [selectedPayments])

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
      statusCode: 'REGISTERED',
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
    setFrom('')
    setTo('')
    payments.applyFilters({
      loanId: undefined,
      clientId: undefined,
      collectionChannelId: undefined,
      registeredByUserId: undefined,
      statusCode: 'REGISTERED',
      from: undefined,
      to: undefined,
    })
  }

  const isEffectivizeEnabled = (payment: PaymentResponse) =>
    rowActions[payment.id]?.allowedActions.find((action) => action.code === 'effectivize')
      ?.enabled ?? false

  const getEffectivizeReason = (payment: PaymentResponse) =>
    rowActions[payment.id]?.allowedActions.find((action) => action.code === 'effectivize')
      ?.reason || 'No disponible'

  const togglePayment = (payment: PaymentResponse) => {
    if (!isEffectivizeEnabled(payment)) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(payment.id)) {
        next.delete(payment.id)
      } else {
        next.add(payment.id)
      }
      return next
    })
  }

  const toggleAllEligible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allSelected = eligiblePayments.every((payment) => next.has(payment.id))
      eligiblePayments.forEach((payment) => {
        if (allSelected) {
          next.delete(payment.id)
        } else {
          next.add(payment.id)
        }
      })
      return next
    })
  }

  const submitBulkEffectivization = async (payload: EffectivizePaymentRequest) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setLastResults([])

    const results: BulkResult[] = []
    for (const payment of selectedPayments) {
      const action = rowActions[payment.id]?.allowedActions.find(
        (item) => item.code === 'effectivize',
      )
      if (!action?.enabled) {
        results.push({
          payment,
          ok: false,
          message: action?.reason || 'Acción no disponible.',
        })
        continue
      }

      const result = await effectivizePaymentAction(payment.id, payload)
      results.push({
        payment,
        ok: result.success,
        message: result.success
          ? 'Efectivizado correctamente.'
          : result.error,
      })
    }

    setLastResults(results)
    setIsSubmitting(false)

    const failed = results.filter((result) => !result.ok)
    if (failed.length) {
      setSubmitError(`${failed.length} pago(s) no pudieron efectivizarse.`)
      notify(`${results.length - failed.length} pago(s) efectivizados, ${failed.length} con error.`, 'warning')
    } else {
      notify(`${results.length} pago(s) efectivizados correctamente.`, 'success')
    }

    await Promise.all([payments.refresh(), businessDate.refresh()])
    setSelectedIds(new Set())
    return failed.length === 0
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
            Efectivización de pagos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Confirma depósitos administrativos de pagos registrados y pendientes de traslado a banco.
          </p>
        </div>
        <Link to="/payments" className="btn-secondary px-4 py-2 text-sm">
          Ver todos los pagos
        </Link>
      </div>

      {!canEffectivize ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
          Puedes consultar esta pantalla, pero tu usuario no tiene `payments.effectivize`.
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Registrado visible" value={formatCurrency(visibleRegisteredTotal)} />
        <MetricCard label="Pagos seleccionados" value={`${selectedPayments.length}`} />
        <MetricCard label="Monto seleccionado" value={formatCurrency(selectedTotal)} />
      </section>

      {selectedByChannel.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Selección por canal
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {selectedByChannel.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="font-medium text-slate-900 dark:text-slate-50">{item.name}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.count} pago(s) · {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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
          <FilterLabel label="Cliente">
            <AsyncSelect<ClientListItem>
              value={clientOption}
              onChange={(option) => setClientOption(option)}
              loadOptions={loadClientOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingClients}
              inputId="effectivization-filter-client"
              instanceId="effectivization-filter-client"
              placeholder="Buscar cliente"
            />
          </FilterLabel>

          <FilterLabel label="Canal">
            <SelectField
              inputId="effectivization-filter-channel"
              instanceId="effectivization-filter-channel"
              value={channelOptions.find((option) => option.value === channelId) ?? null}
              onChange={(option) => setChannelId(option?.value ?? '')}
              options={channelOptions}
              placeholder="Todos"
              isLoading={supportData.isLoadingChannels}
            />
          </FilterLabel>

          <FilterLabel label="Usuario registrador">
            <AsyncSelect<SecurityUser>
              value={registeredByOption}
              onChange={(option) => setRegisteredByOption(option)}
              loadOptions={loadUserOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingUsers}
              inputId="effectivization-filter-user"
              instanceId="effectivization-filter-user"
              placeholder="Buscar usuario"
            />
          </FilterLabel>

          <FilterLabel label="Desde">
            <DatePicker value={from} onChange={setFrom} />
          </FilterLabel>

          <FilterLabel label="Hasta">
            <DatePicker value={to} onChange={setTo} />
          </FilterLabel>
        </div>
      </ListFiltersBar>

      {supportData.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {supportData.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <span>{payments.totalCount} pagos registrados encontrados</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
            disabled={!selectedPayments.length || isSubmitting || !canEffectivize}
            onClick={() => setModalOpen(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Efectivizar seleccionados
          </button>
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

      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      eligiblePayments.length > 0 &&
                      eligiblePayments.every((payment) => selectedIds.has(payment.id))
                    }
                    onChange={toggleAllEligible}
                    disabled={!eligiblePayments.length || !canEffectivize}
                    className="h-4 w-4 rounded border-slate-300 text-primary"
                  />
                </th>
                {[
                  'Recibo interno',
                  'Préstamo',
                  'Cliente',
                  'Canal',
                  'Usuario',
                  'Fecha',
                  'Tipo',
                  'Monto',
                  'Acción',
                  'Ver',
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {payments.isLoading || isLoadingPermissions ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Cargando pagos...
                  </td>
                </tr>
              ) : payments.error ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                    {payments.error}
                  </td>
                </tr>
              ) : !payments.items.length ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No hay pagos registrados para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                payments.items.map((payment) => {
                  const enabled = isEffectivizeEnabled(payment) && canEffectivize
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(payment.id)}
                          disabled={!enabled}
                          title={enabled ? 'Seleccionar pago' : getEffectivizeReason(payment)}
                          onChange={() => togglePayment(payment)}
                          className="h-4 w-4 rounded border-slate-300 text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {payment.internalReceiptNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {payment.loanNo || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {payment.clientFullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {payment.collectionChannelName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {payment.registeredByUserName || payment.registeredByUserId || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {translatePaymentType(payment.paymentTypeCode, payment.paymentTypeName)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            enabled
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
                              : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
                          }`}
                          title={enabled ? 'Disponible' : getEffectivizeReason(payment)}
                        >
                          {enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          {enabled ? 'Disponible' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/payments/${payment.id}`}
                          className="btn-table-action inline-flex w-7 items-center justify-center px-0"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination page={payments.page} totalPages={payments.totalPages} onPageChange={payments.setPage} />
      </TableContainer>

      {lastResults.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Resultado de última efectivización
          </p>
          {submitError ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{submitError}</p>
          ) : null}
          <div className="mt-3 max-h-52 overflow-auto">
            {lastResults.map((result) => (
              <div
                key={result.payment.id}
                className="flex flex-col gap-1 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
              >
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {result.payment.internalReceiptNumber || result.payment.loanNo}
                </span>
                <span className={result.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <BulkEffectivizePaymentsModal
        open={modalOpen}
        payments={selectedPayments}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={isSubmitting}
        backendError={submitError}
        onClose={() => {
          setSubmitError(null)
          setModalOpen(false)
        }}
        onSubmit={submitBulkEffectivization}
      />
    </div>
  )
}

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)

const FilterLabel = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </label>
    {children}
  </div>
)
