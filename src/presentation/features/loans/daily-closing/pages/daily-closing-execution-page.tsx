import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSearch,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { recoverDailyClosingRunAction } from '@/core/actions/loans/recover-daily-closing-run.action'
import { searchDailyClosingRunsAction } from '@/core/actions/loans/search-daily-closing-runs.action'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import { DailyClosingAccessRestricted } from '@/presentation/features/loans/daily-closing/components/daily-closing-access-restricted'
import {
  resolveDailyClosingActions,
  type DailyClosingActions,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-actions'
import type { DailyClosingActionKind } from '@/presentation/features/loans/daily-closing/components/daily-closing-actions-panel'
import { DailyClosingRunResultSummary } from '@/presentation/features/loans/daily-closing/components/daily-closing-run-result-summary'
import {
  formatDateOnly,
  formatDateTime,
  getRunStatusBadgeClass,
  translateRunStatus,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-ui'
import { useDailyClosingRunDetail } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-run-detail'
import { useDailyClosingRunMutation } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-run-mutation'
import { useDailyClosingStatus } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-status'
import { notifyBusinessDateChanged } from '@/presentation/features/system-business-date/business-date-events'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

const ACTIVE_RUN_STATUSES = new Set(['RUNNING', 'FINALIZING'])
const VALID_ACTIONS = new Set<DailyClosingActionKind>([
  'dry-run',
  'run',
  'reprocess',
  'recover',
])

export const DailyClosingExecutionPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedAction = searchParams.get('action') as DailyClosingActionKind | null
  const actionKind = requestedAction && VALID_ACTIONS.has(requestedAction)
    ? requestedAction
    : null
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('loans.daily_closing.read')
  const canWrite = hasPermission('loans.daily_closing.run')
  const statusQuery = useDailyClosingStatus(canRead)
  const mutation = useDailyClosingRunMutation()
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [commandStarted, setCommandStarted] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [result, setResult] = useState<DailyLoanClosingRunResponse | null>(null)
  const currentRunId =
    statusQuery.status?.hasRunningRun || statusQuery.status?.recoveryRequired
      ? statusQuery.status?.currentRunId
      : result?.id
  const runQuery = useDailyClosingRunDetail(
    currentRunId ?? undefined,
    canRead && Boolean(currentRunId),
  )

  const actions = useMemo(
    () =>
      statusQuery.status
        ? resolveDailyClosingActions(statusQuery.status, canWrite)
        : null,
    [canWrite, statusQuery.status],
  )
  const monitoredRun = runQuery.run ?? result
  const isActive =
    Boolean(statusQuery.status?.hasRunningRun) ||
    Boolean(monitoredRun && ACTIVE_RUN_STATUSES.has(monitoredRun.status))
  const isMonitoring = commandStarted || isActive || Boolean(result)
  const shouldPoll = isActive || (commandStarted && !result)
  const isDryRun = actionKind === 'dry-run'
  const isRecovery = actionKind === 'recover'
  const isReprocess =
    actionKind === 'reprocess' ||
    (isDryRun && Boolean(statusQuery.status?.hasCompletedRunForBusinessDate)) ||
    (actionKind === 'run' && statusQuery.status?.currentRunStatus === 'ABANDONED')

  useEffect(() => {
    setNotes('')
    setConfirmed(false)
    setCommandStarted(false)
    setLocalError(null)
    setResult(null)
    mutation.setError(null)
  }, [actionKind, mutation.setError])

  useEffect(() => {
    if (!canRead || !shouldPoll) return
    const intervalId = window.setInterval(() => {
      void statusQuery.refresh()
      if (currentRunId) {
        void runQuery.refresh()
      }
    }, 7000)
    return () => window.clearInterval(intervalId)
  }, [
    canRead,
    currentRunId,
    runQuery.refresh,
    shouldPoll,
    statusQuery.refresh,
  ])

  useEffect(() => {
    if (!monitoredRun || ACTIVE_RUN_STATUSES.has(monitoredRun.status)) return
    setResult(monitoredRun)
    if (monitoredRun.status === 'COMPLETED') {
      notifyBusinessDateChanged()
    }
  }, [monitoredRun])

  const refreshAll = async () => {
    await statusQuery.refresh()
    if (currentRunId) await runQuery.refresh()
  }

  const validateRequestedAction = (
    resolvedActions: DailyClosingActions,
  ): string | null => {
    if (!actionKind) return 'La accion solicitada no es valida.'
    if (actionKind === 'recover' && !resolvedActions.canRecover) {
      return resolvedActions.blockReason ?? 'La ejecucion no requiere recuperacion.'
    }
    if (actionKind === 'run' && !resolvedActions.canRun) {
      return resolvedActions.blockReason ?? 'El cierre no puede ejecutarse.'
    }
    if (actionKind === 'reprocess' && !resolvedActions.canReprocess) {
      return resolvedActions.blockReason ?? 'El cierre no puede reprocesarse.'
    }
    if (
      actionKind === 'dry-run' &&
      !resolvedActions.canDryRun &&
      !resolvedActions.canDryRunReprocess
    ) {
      return resolvedActions.blockReason ?? 'La simulacion no puede ejecutarse.'
    }
    return null
  }

  const handleRun = async () => {
    setLocalError(null)
    mutation.setError(null)
    const freshStatus = await statusQuery.refresh()
    if (!freshStatus) {
      setLocalError('No se pudo confirmar el estado operativo antes de ejecutar.')
      return
    }

    const freshActions = resolveDailyClosingActions(freshStatus, canWrite)
    const validationError = validateRequestedAction(freshActions)
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setCommandStarted(true)
    const runResult = await mutation.run({
      businessDate: freshStatus.businessDate,
      allowReprocess:
        actionKind === 'reprocess' ||
        (actionKind === 'dry-run' && freshStatus.hasCompletedRunForBusinessDate),
      dryRun: actionKind === 'dry-run',
      closeBusinessDayOnSuccess: actionKind !== 'dry-run',
      notes: notes.trim() || null,
    })

    if (runResult) {
      setResult(runResult)
      if (runResult.status === 'COMPLETED') {
        notifyBusinessDateChanged()
      }
    }

    const reconciledStatus = await statusQuery.refresh()
    if (reconciledStatus?.hasRunningRun && reconciledStatus.currentRunId) return
    if (runResult) {
      await runQuery.refresh()
      return
    }

    const historyResult = await searchDailyClosingRunsAction({
      businessDate: freshStatus.businessDate,
      page: 1,
      pageSize: 25,
    })
    if (historyResult.success && historyResult.data.items.length > 0) {
      setResult(historyResult.data.items[0])
      return
    }

    setCommandStarted(false)
    setLocalError(
      'No se identifico una ejecucion activa ni un resultado reciente. Refresque el estado antes de intentar nuevamente.',
    )
  }

  const handleRecover = async () => {
    setLocalError(null)
    const freshStatus = await statusQuery.refresh()
    const freshActions = freshStatus
      ? resolveDailyClosingActions(freshStatus, canWrite)
      : null
    if (!freshStatus || !freshActions?.canRecover || !freshStatus.currentRunId) {
      setLocalError(
        freshActions?.blockReason ?? 'No existe una ejecucion recuperable.',
      )
      return
    }

    setRecovering(true)
    setCommandStarted(true)
    const recoverResult = await recoverDailyClosingRunAction(freshStatus.currentRunId)
    setRecovering(false)

    if (!recoverResult.success) {
      setLocalError(recoverResult.error)
      await statusQuery.refresh()
      setCommandStarted(false)
      return
    }

    setResult(recoverResult.data)
    if (recoverResult.data.status === 'COMPLETED') {
      notifyBusinessDateChanged()
    }
    await refreshAll()
  }

  if (!isLoadingPermissions && !canRead) {
    return <DailyClosingAccessRestricted />
  }

  const status = statusQuery.status
  const actionError = actions ? validateRequestedAction(actions) : null
  const processing = mutation.isLoading || recovering
  const canSubmit =
    Boolean(status && actions && !actionError) &&
    !processing &&
    (isDryRun || confirmed)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => navigate('/loans/daily-closing')}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al cierre diario
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {getActionTitle(actionKind, isReprocess)}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Preparacion, confirmacion y seguimiento de la ejecucion en una sola vista.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          onClick={() => void refreshAll()}
          disabled={statusQuery.isLoading}
        >
          <RefreshCcw className="h-4 w-4" />
          Refrescar
        </button>
      </div>

      {(statusQuery.error || localError || mutation.error) ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {localError ?? mutation.error ?? statusQuery.error}
        </div>
      ) : null}

      {isMonitoring ? (
        <ExecutionMonitor
          run={monitoredRun}
          status={status}
          processing={processing}
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Configuracion de la operacion
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                La fecha proviene del backend y no puede modificarse.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField
                label="Fecha operativa"
                value={formatDateOnly(status?.businessDate)}
              />
              <ReadOnlyField
                label="Tipo de operacion"
                value={getActionTitle(actionKind, isReprocess)}
              />
            </div>

            <OperationNotice
              isDryRun={isDryRun}
              isReprocess={isReprocess}
              pendingPayments={status?.pendingRegisteredPayments ?? 0}
            />

            {!isRecovery ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Nota operativa
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Opcional"
                  />
                </label>
              </>
            ) : null}

            {!isDryRun ? (
              <label className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 dark:border-red-700 dark:bg-slate-950"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                <span>
                  Confirmo que revise la fecha, las advertencias y el impacto de esta
                  operacion.
                </span>
              </label>
            ) : null}

            {actionError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                {actionError}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Link
                to="/loans/daily-closing"
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancelar
              </Link>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() =>
                  void (isRecovery ? handleRecover() : handleRun())
                }
                disabled={!canSubmit}
              >
                {isRecovery ? (
                  <Wrench className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {getSubmitLabel(actionKind, isReprocess)}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <StatusSummary status={status} />
          </aside>
        </section>
      )}

      {result && !ACTIVE_RUN_STATUSES.has(result.status) ? (
        <DailyClosingRunResultSummary result={result} />
      ) : null}

      {result?.status === 'ABANDONED' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <span>
            La ejecucion fue marcada como abandonada. El siguiente intento comenzara
            desde el primer paso.
          </span>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              setResult(null)
              setCommandStarted(false)
              setConfirmed(false)
              setLocalError(null)
              navigate('/loans/daily-closing/execute?action=run')
            }}
          >
            Preparar reproceso
          </button>
        </div>
      ) : null}
    </div>
  )
}

interface ExecutionMonitorProps {
  run: DailyLoanClosingRunResponse | null
  status: DailyLoanClosingStatusResponse | null
  processing: boolean
}

const ExecutionMonitor = ({ run, status, processing }: ExecutionMonitorProps) => {
  const activeStatus = run?.status ?? status?.currentRunStatus
  const active = Boolean(activeStatus && ACTIVE_RUN_STATUSES.has(activeStatus))

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {active || processing ? (
              <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {activeStatus === 'FINALIZING'
                  ? 'Procesamiento terminado; confirmando fecha operativa'
                  : active
                    ? 'Procesando cierre'
                    : 'Ejecucion finalizada'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {run?.id
                  ? `Run ${run.id}`
                  : 'Buscando la ejecucion activa en el servidor...'}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRunStatusBadgeClass(activeStatus)}`}
          >
            {translateRunStatus(activeStatus)}
          </span>
        </div>
      </div>

      {active ? (
        <div className="h-1.5 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      ) : null}

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <MonitorMetric
          icon={<Clock3 className="h-4 w-4" />}
          label="Ultimo heartbeat"
          value={formatDateTime(run?.heartbeatAt ?? status?.currentRunHeartbeatAt)}
        />
        <MonitorMetric
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Lease registrado"
          value={formatDateTime(run?.leaseExpiresAt ?? status?.currentRunLeaseExpiresAt)}
        />
        <MonitorMetric
          icon={<FileSearch className="h-4 w-4" />}
          label="Detalles"
          value={
            run?.id
              ? 'Disponibles durante la ejecucion'
              : 'Se habilitaran al identificar el run'
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Los contadores se consolidan al finalizar. Esta vista no calcula un porcentaje
          porque los datos parciales no representan el avance exacto.
        </p>
        {run?.id ? (
          <Link
            to={`/loans/daily-closing/runs/${run.id}`}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Ver detalles incrementales
          </Link>
        ) : null}
      </div>
    </section>
  )
}

const StatusSummary = ({
  status,
}: {
  status: DailyLoanClosingStatusResponse | null
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <h2 className="font-semibold text-slate-900 dark:text-slate-50">
      Condiciones actuales
    </h2>
    <div className="mt-4 space-y-3 text-sm">
      <SummaryRow label="Dia operativo" value={status?.isDayOpen ? 'Abierto' : 'Cerrado'} />
      <SummaryRow label="Contexto contable" value={status?.postingContextStatus ?? '-'} />
      <SummaryRow
        label="Prestamos candidatos"
        value={String(status?.activeLoans ?? 0)}
      />
      <SummaryRow
        label="Vencidos estimados"
        value={String(status?.overdueLoansEstimate ?? 0)}
      />
      <SummaryRow
        label="Pagos pendientes"
        value={String(status?.pendingRegisteredPayments ?? 0)}
      />
    </div>
  </div>
)

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
  </div>
)

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)

const MonitorMetric = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
      {icon}
      {label}
    </div>
    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)

const OperationNotice = ({
  isDryRun,
  isReprocess,
  pendingPayments,
}: {
  isDryRun: boolean
  isReprocess: boolean
  pendingPayments: number
}) => (
  <div className="space-y-3">
    <div
      className={`rounded-lg border p-4 text-sm ${
        isDryRun
          ? 'border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
      }`}
    >
      {isDryRun
        ? 'La simulacion no aplica efectos contables, mora, cambios de estado ni snapshots.'
        : isReprocess
          ? 'El reproceso comienza desde el primer paso y reutiliza los controles idempotentes del backend.'
          : 'El cierre real puede generar efectos contables y de cartera.'}
    </div>
    {pendingPayments > 0 ? (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
        Hay {pendingPayments} pagos registrados pendientes. Este flujo no los
        efectiviza.
      </div>
    ) : null}
  </div>
)

const getActionTitle = (
  action: DailyClosingActionKind | null,
  isReprocess: boolean,
) => {
  if (action === 'recover') return 'Recuperar ejecucion'
  if (action === 'dry-run') {
    return isReprocess ? 'Simular reproceso' : 'Simular cierre'
  }
  if (action === 'reprocess' || isReprocess) return 'Reprocesar cierre diario'
  return 'Ejecutar cierre diario'
}

const getSubmitLabel = (
  action: DailyClosingActionKind | null,
  isReprocess: boolean,
) => {
  if (action === 'recover') return 'Recuperar ejecucion'
  if (action === 'dry-run') {
    return isReprocess ? 'Ejecutar simulacion de reproceso' : 'Ejecutar simulacion'
  }
  if (action === 'reprocess' || isReprocess) return 'Confirmar reproceso'
  return 'Confirmar y ejecutar cierre'
}
