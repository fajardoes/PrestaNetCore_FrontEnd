import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DailyClosingRunStatus } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import { DailyClosingAccessRestricted } from '@/presentation/features/loans/daily-closing/components/daily-closing-access-restricted'
import { DailyClosingRunsTable } from '@/presentation/features/loans/daily-closing/components/daily-closing-runs-table'
import { DAILY_CLOSING_RUN_STATUS_OPTIONS } from '@/presentation/features/loans/daily-closing/components/daily-closing-ui'
import { useDailyClosingRunsList } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-runs-list'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'

const statusOptions: Array<SelectOption<DailyClosingRunStatus>> = [
  { value: '', label: 'Todos' },
  ...DAILY_CLOSING_RUN_STATUS_OPTIONS,
]

export const DailyClosingRunsPage = () => {
  const navigate = useNavigate()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('loans.daily_closing.read')
  const runs = useDailyClosingRunsList(canRead)
  const [businessDate, setBusinessDate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [statusCode, setStatusCode] = useState('')

  const selectedStatus = useMemo(
    () => statusOptions.find((option) => option.value === statusCode) ?? statusOptions[0],
    [statusCode],
  )

  const applyFilters = () => {
    runs.applyFilters({
      businessDate: businessDate || undefined,
      from: from || undefined,
      to: to || undefined,
      status: (selectedStatus.meta ?? undefined) as DailyClosingRunStatus | undefined,
    })
  }

  const resetFilters = () => {
    setBusinessDate('')
    setFrom('')
    setTo('')
    setStatusCode('')
    runs.applyFilters({
      businessDate: undefined,
      from: undefined,
      to: undefined,
      status: undefined,
    })
  }

  if (!isLoadingPermissions && !canRead) {
    return <DailyClosingAccessRestricted />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Historico de cierres diarios
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Consulta runs de cierre por fecha, rango y estado.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={() => navigate('/loans/daily-closing')}
        >
          Volver al dashboard
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha exacta
            </span>
            <div className="mt-1">
              <DatePicker value={businessDate} onChange={setBusinessDate} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Desde
            </span>
            <div className="mt-1">
              <DatePicker value={from} onChange={setFrom} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Hasta
            </span>
            <div className="mt-1">
              <DatePicker value={to} onChange={setTo} />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado
            </span>
            <div className="mt-1">
              <SelectField
                value={selectedStatus}
                onChange={(option) => setStatusCode(option?.value ?? '')}
                options={statusOptions}
                placeholder="Todos"
                isClearable={false}
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={resetFilters}>
            Limpiar filtros
          </button>
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={applyFilters}>
            Buscar
          </button>
        </div>
      </div>

      <DailyClosingRunsTable
        items={runs.items}
        isLoading={runs.isLoading}
        error={runs.error}
        page={runs.page}
        totalPages={runs.totalPages}
        pageSize={runs.pageSize}
        onPageChange={runs.setPage}
        onPageSizeChange={runs.setPageSize}
        onViewDetail={(run) => navigate(`/loans/daily-closing/runs/${run.id}`)}
      />
    </div>
  )
}
