import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import { usePaymentSupportData } from '@/presentation/features/payments/hooks/use-payment-support-data'
import { usePaymentsList } from '@/presentation/features/payments/hooks/use-payments-list'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { DatePicker } from '@/presentation/share/components/date-picker'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import SelectField from '@/presentation/share/components/select'
import { PaymentsTable } from '@/presentation/features/payments/components/payments-table'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'REGISTERED', label: 'Registrado' },
  { value: 'REVERSED', label: 'Revertido' },
]

export const PaymentsListPage = () => {
  const navigate = useNavigate()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.read')
  const payments = usePaymentsList(canRead)
  const supportData = usePaymentSupportData()

  const [loanCode, setLoanCode] = useState('')
  const [loanId, setLoanId] = useState<string | undefined>(undefined)
  const [clientOption, setClientOption] =
    useState<AsyncSelectOption<ClientListItem> | null>(null)
  const [statusCode, setStatusCode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const loadClientOptions = async (inputValue: string) => {
    const results = await supportData.searchClients(inputValue)
    return results.map((client) => ({
      value: client.id,
      label: `${client.nombreCompleto} - ${client.identidad}`,
      meta: client,
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
      statusCode: statusCode || undefined,
      from: from || undefined,
      to: to || undefined,
    })
  }

  const resetFilters = () => {
    setLoanCode('')
    setLoanId(undefined)
    setClientOption(null)
    setStatusCode('')
    setFrom('')
    setTo('')
    payments.applyFilters({
      loanId: undefined,
      clientId: undefined,
      statusCode: undefined,
      from: undefined,
      to: undefined,
    })
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
      />
    </div>
  )
}
