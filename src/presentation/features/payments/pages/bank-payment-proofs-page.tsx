import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPaymentActionsAction } from '@/core/actions/payments/get-payment-actions.action'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { EffectivizePaymentModal } from '@/presentation/features/payments/components/effectivize-payment-modal'
import { PaymentsTable } from '@/presentation/features/payments/components/payments-table'
import { RejectBankPaymentProofModal } from '@/presentation/features/payments/components/reject-bank-payment-proof-modal'
import { ReversePaymentModal } from '@/presentation/features/payments/components/reverse-payment-modal'
import { usePaymentMutations } from '@/presentation/features/payments/hooks/use-payment-mutations'
import { usePaymentReceiptReport } from '@/presentation/features/payments/hooks/use-payment-receipt-report'
import { usePaymentSupportData } from '@/presentation/features/payments/hooks/use-payment-support-data'
import { usePaymentsList } from '@/presentation/features/payments/hooks/use-payments-list'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { useNotifications } from '@/providers/NotificationProvider'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import SelectField from '@/presentation/share/components/select'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'REGISTERED', label: 'Registrado' },
  { value: 'PENDING_REVIEW', label: 'Pendiente de revisión' },
  { value: 'EFFECTIVIZED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'REVERSED', label: 'Reversado' },
]

export const BankPaymentProofsPage = () => {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canReadAll = hasPermission('bank_payment_proofs.read_all')
  const canRead = hasPermission('bank_payment_proofs.read') || canReadAll
  const canReadBankEntities = hasPermission('bank_entities.read') || hasPermission('bank_entities.manage')
  const payments = usePaymentsList(canRead, undefined, 'bank-proofs')
  const supportData = usePaymentSupportData()
  const businessDate = useBusinessDate()
  const mutations = usePaymentMutations()
  const receiptReport = usePaymentReceiptReport()

  const [loanCode, setLoanCode] = useState('')
  const [loanId, setLoanId] = useState<string | undefined>(undefined)
  const [clientOption, setClientOption] =
    useState<AsyncSelectOption<ClientListItem> | null>(null)
  const [registeredByOption, setRegisteredByOption] =
    useState<AsyncSelectOption<SecurityUser> | null>(null)
  const [bankEntityOption, setBankEntityOption] =
    useState<AsyncSelectOption<BankEntityResponse> | null>(null)
  const [statusCode, setStatusCode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rowActions, setRowActions] = useState<Record<string, PaymentActionsResponse>>({})
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)

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

  const loadBankEntityOptions = async (inputValue: string) => {
    const results = await supportData.searchBankEntities(inputValue)
    return results.map((entity) => ({
      value: entity.id,
      label: `${entity.code} - ${entity.name}`,
      meta: entity,
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
      bankEntityId: bankEntityOption?.value || undefined,
      registeredByUserId: canReadAll ? registeredByOption?.value || undefined : undefined,
      statusCode: statusCode || undefined,
      from: from || undefined,
      to: to || undefined,
    })
  }

  const resetFilters = () => {
    setLoanCode('')
    setLoanId(undefined)
    setClientOption(null)
    setRegisteredByOption(null)
    setBankEntityOption(null)
    setStatusCode('')
    setFrom('')
    setTo('')
    payments.applyFilters({
      loanId: undefined,
      clientId: undefined,
      bankEntityId: undefined,
      registeredByUserId: undefined,
      statusCode: undefined,
      from: undefined,
      to: undefined,
    })
  }

  const getActionDisabledReason = (
    payment: PaymentResponse,
    code: 'effectivize' | 'reject' | 'reverse',
  ) => {
    const action = rowActions[payment.id]?.allowedActions.find((item) => item.code === code)
    if (action?.enabled) return null
    return action?.reason || 'Acción no disponible.'
  }

  const refreshAfterMutation = async () => {
    await Promise.all([payments.refresh(), businessDate.refresh()])
    setSelectedPayment(null)
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar abonos bancarios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Abonos bancarios
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gestiona comprobantes pendientes de revisión, aprobación bancaria y reversas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => navigate('/bank-payment-proofs/new')}
          >
            Registrar comprobante
          </button>
          {canReadBankEntities ? (
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={() => navigate('/bank-payment-proofs/catalogs/bank-entities')}
            >
              Entidades bancarias
            </button>
          ) : null}
        </div>
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
          <FilterLabel label="Cliente">
            <AsyncSelect<ClientListItem>
              value={clientOption}
              onChange={(option) => setClientOption(option)}
              loadOptions={loadClientOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingClients}
              inputId="bank-proofs-filter-client"
              instanceId="bank-proofs-filter-client"
              placeholder="Buscar cliente"
            />
          </FilterLabel>
          {canReadAll ? (
            <FilterLabel label="Usuario registrador">
              <AsyncSelect<SecurityUser>
                value={registeredByOption}
                onChange={(option) => setRegisteredByOption(option)}
                loadOptions={loadUserOptions}
                defaultOptions
                isClearable
                isLoading={supportData.isLoadingUsers}
                inputId="bank-proofs-filter-user"
                instanceId="bank-proofs-filter-user"
                placeholder="Buscar usuario"
              />
            </FilterLabel>
          ) : null}
          <FilterLabel label="Estado">
            <SelectField
              inputId="bank-proofs-filter-status"
              instanceId="bank-proofs-filter-status"
              value={STATUS_OPTIONS.find((option) => option.value === statusCode) ?? null}
              onChange={(option) => setStatusCode(option?.value ?? '')}
              options={STATUS_OPTIONS}
              placeholder="Todos"
            />
          </FilterLabel>
          <FilterLabel label="Entidad bancaria">
            <AsyncSelect<BankEntityResponse>
              value={bankEntityOption}
              onChange={(option) => setBankEntityOption(option)}
              loadOptions={loadBankEntityOptions}
              defaultOptions
              isClearable
              isLoading={supportData.isLoadingBankEntities}
              inputId="bank-proofs-filter-bank-entity"
              instanceId="bank-proofs-filter-bank-entity"
              placeholder="Buscar banco"
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

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <span>{payments.totalCount} abonos bancarios encontrados</span>
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
        pageSize={payments.pageSize}
        totalPages={payments.totalPages}
        onPageChange={payments.setPage}
        onView={(payment) => navigate(`/bank-payment-proofs/${payment.id}`)}
        actionsByPaymentId={rowActions}
        showBankColumns
        onEffectivize={(payment) => {
          mutations.setError(null)
          setSelectedPayment(payment)
          setApproveOpen(true)
        }}
        onReject={(payment) => {
          mutations.setError(null)
          setSelectedPayment(payment)
          setRejectOpen(true)
        }}
        onReverse={(payment) => {
          mutations.setError(null)
          setSelectedPayment(payment)
          setReverseOpen(true)
        }}
        onPrintReceipt={async (payment) => {
          const result = await receiptReport.openReceipt(payment.id)
          if (!result.success) notify(result.error, 'error')
        }}
      />

      <EffectivizePaymentModal
        open={approveOpen}
        payment={selectedPayment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={
          selectedPayment ? getActionDisabledReason(selectedPayment, 'effectivize') : null
        }
        onClose={() => {
          mutations.setError(null)
          setApproveOpen(false)
        }}
        onSubmit={async (payload) => {
          if (!selectedPayment) return false
          const disabledReason = getActionDisabledReason(selectedPayment, 'effectivize')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.approveBankProof(selectedPayment.id, {
            bankEntityId: payload.bankEntityId || '',
            effectivizationDate: payload.effectivizationDate,
            verifiedBankDepositDate: payload.bankDepositDate,
            verifiedBankReferenceNumber: payload.bankReferenceNumber,
            reviewNotes: payload.notes,
          })
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await payments.refresh()
            return false
          }
          notify('Abono bancario aprobado correctamente.', 'success')
          await refreshAfterMutation()
          return true
        }}
      />

      <RejectBankPaymentProofModal
        open={rejectOpen}
        payment={selectedPayment}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={
          selectedPayment ? getActionDisabledReason(selectedPayment, 'reject') : null
        }
        onClose={() => {
          mutations.setError(null)
          setRejectOpen(false)
        }}
        onSubmit={async (payload) => {
          if (!selectedPayment) return false
          const disabledReason = getActionDisabledReason(selectedPayment, 'reject')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.rejectBankProof(selectedPayment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await payments.refresh()
            return false
          }
          notify('Abono bancario rechazado correctamente.', 'success')
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
          const result = await mutations.reverseBankProof(selectedPayment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await payments.refresh()
            return false
          }
          notify('Abono bancario reversado correctamente.', 'success')
          await refreshAfterMutation()
          return true
        }}
      />
    </div>
  )
}

const FilterLabel = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </label>
    {children}
  </div>
)
