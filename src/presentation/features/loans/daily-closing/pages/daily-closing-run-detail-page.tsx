import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type {
  DailyClosingProcessCode,
  DailyClosingProcessingStatus,
} from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'
import { DailyClosingAccessRestricted } from '@/presentation/features/loans/daily-closing/components/daily-closing-access-restricted'
import { DailyClosingRunDetailsTable } from '@/presentation/features/loans/daily-closing/components/daily-closing-run-details-table'
import {
  DAILY_CLOSING_PROCESSING_STATUS_OPTIONS,
  DAILY_CLOSING_PROCESS_OPTIONS,
  formatDateOnly,
  formatDateTime,
  formatDuration,
  formatNumber,
  getRunStatusBadgeClass,
  runHasErrors,
  translateRunStatus,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-ui'
import { useDailyClosingRunDetail } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-run-detail'
import { useDailyClosingRunDetailsList } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-run-details-list'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'

const processingStatusOptions: Array<SelectOption<DailyClosingProcessingStatus>> = [
  { value: '', label: 'Todos' },
  ...DAILY_CLOSING_PROCESSING_STATUS_OPTIONS,
]

const processOptions: Array<SelectOption<DailyClosingProcessCode>> = [
  { value: '', label: 'Todos' },
  ...DAILY_CLOSING_PROCESS_OPTIONS,
]

export const DailyClosingRunDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('loans.daily_closing.read')
  const runQuery = useDailyClosingRunDetail(id, canRead)
  const details = useDailyClosingRunDetailsList(id, canRead)
  const [processingStatus, setProcessingStatus] = useState('')
  const [processCode, setProcessCode] = useState('')
  const [loanNo, setLoanNo] = useState('')
  const [loanId, setLoanId] = useState('')
  const isRunActive =
    runQuery.run?.status === 'RUNNING' || runQuery.run?.status === 'FINALIZING'

  useEffect(() => {
    if (!isRunActive) return
    const intervalId = window.setInterval(() => {
      void Promise.all([runQuery.refresh(), details.refresh()])
    }, 12000)
    return () => window.clearInterval(intervalId)
  }, [details.refresh, isRunActive, runQuery.refresh])

  const selectedProcessingStatus = useMemo(
    () =>
      processingStatusOptions.find((option) => option.value === processingStatus) ??
      processingStatusOptions[0],
    [processingStatus],
  )

  const selectedProcess = useMemo(
    () => processOptions.find((option) => option.value === processCode) ?? processOptions[0],
    [processCode],
  )

  const applyFilters = (override?: {
    processingStatus?: DailyClosingProcessingStatus
  }) => {
    const nextProcessingStatus = override?.processingStatus
    details.applyFilters({
      processingStatus:
        nextProcessingStatus ??
        ((selectedProcessingStatus.meta ?? undefined) as
          | DailyClosingProcessingStatus
          | undefined),
      processCode: (selectedProcess.meta ?? undefined) as
        | DailyClosingProcessCode
        | undefined,
      loanNo: loanNo.trim() || undefined,
      loanId: loanId.trim() || undefined,
    })
  }

  const resetFilters = () => {
    setProcessingStatus('')
    setProcessCode('')
    setLoanNo('')
    setLoanId('')
    details.applyFilters({
      processingStatus: undefined,
      processCode: undefined,
      loanNo: undefined,
      loanId: undefined,
    })
  }

  const filterFailed = () => {
    setProcessingStatus('FAILED')
    details.applyFilters({
      processingStatus: 'FAILED',
      processCode: (selectedProcess.meta ?? undefined) as
        | DailyClosingProcessCode
        | undefined,
      loanNo: loanNo.trim() || undefined,
      loanId: loanId.trim() || undefined,
    })
  }

  if (!isLoadingPermissions && !canRead) {
    return <DailyClosingAccessRestricted />
  }

  const run = runQuery.run

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Detalle de cierre diario
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cabecera del run y procesos auditables registrados por el backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/loans/daily-closing/runs" className="btn-secondary px-4 py-2 text-sm">
            Volver al historico
          </Link>
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={() => {
              void Promise.all([runQuery.refresh(), details.refresh()])
            }}
          >
            Refrescar
          </button>
        </div>
      </div>

      {runQuery.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {runQuery.error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {runQuery.isLoading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando run...</p>
        ) : run ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Fecha operativa {formatDateOnly(run.businessDate)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Run {run.id}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRunStatusBadgeClass(run.status)}`}
              >
                {translateRunStatus(run.status)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Total prestamos', formatNumber(run.totalLoans)],
                ['Procesados', formatNumber(run.processedLoans)],
                ['Fallidos', formatNumber(run.failedLoans)],
                ['Omitidos', formatNumber(run.skippedLoans)],
                ['Asientos', formatNumber(run.generatedJournalEntries)],
                ['Eventos', formatNumber(run.generatedEvents)],
                ['Snapshots', formatNumber(run.generatedSnapshots)],
                ['Duracion', formatDuration(run.executionTimeMs)],
                ['Ultimo heartbeat', formatDateTime(run.heartbeatAt)],
                ['Lease registrado', formatDateTime(run.leaseExpiresAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {runHasErrors(run.status) ? (
              <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Este run tiene errores o procesos fallidos. Puedes filtrar los detalles
                  fallidos para revisar el origen.
                </span>
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-sm"
                  onClick={filterFailed}
                >
                  Ver fallidos
                </button>
              </div>
            ) : null}

            {run.errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                {run.errorMessage}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No se encontro el run solicitado.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado de procesamiento
            </span>
            <div className="mt-1">
              <SelectField
                value={selectedProcessingStatus}
                onChange={(option) => setProcessingStatus(option?.value ?? '')}
                options={processingStatusOptions}
                placeholder="Todos"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Proceso
            </span>
            <div className="mt-1">
              <SelectField
                value={selectedProcess}
                onChange={(option) => setProcessCode(option?.value ?? '')}
                options={processOptions}
                placeholder="Todos"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Numero de prestamo
            </span>
            <input
              type="text"
              value={loanNo}
              onChange={(event) => setLoanNo(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="PRE-2026-000123"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Id tecnico del prestamo
            </span>
            <input
              type="text"
              value={loanId}
              onChange={(event) => setLoanId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="guid opcional"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={resetFilters}>
            Limpiar filtros
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => applyFilters()}
          >
            Buscar
          </button>
        </div>
      </div>

      <DailyClosingRunDetailsTable
        items={details.items}
        isLoading={details.isLoading}
        error={details.error}
        page={details.page}
        totalPages={details.totalPages}
        pageSize={details.pageSize}
        onPageChange={details.setPage}
        onPageSizeChange={details.setPageSize}
      />
    </div>
  )
}
