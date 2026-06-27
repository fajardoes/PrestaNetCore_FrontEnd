import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DailyClosingAccessRestricted } from '@/presentation/features/loans/daily-closing/components/daily-closing-access-restricted'
import {
  DailyClosingActionsPanel,
  type DailyClosingActionKind,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-actions-panel'
import { DailyClosingStatusCards } from '@/presentation/features/loans/daily-closing/components/daily-closing-status-cards'
import {
  formatDateTime,
  translateRunStatus,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-ui'
import { useDailyClosingStatus } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-status'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

export const DailyClosingDashboardPage = () => {
  const navigate = useNavigate()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('loans.daily_closing.read')
  const canRun = hasPermission('loans.daily_closing.run')
  const statusQuery = useDailyClosingStatus(canRead)

  useEffect(() => {
    if (!canRead || !statusQuery.status?.hasRunningRun) return
    const intervalId = window.setInterval(() => {
      void statusQuery.refresh()
    }, 7000)
    return () => window.clearInterval(intervalId)
  }, [canRead, statusQuery.refresh, statusQuery.status?.hasRunningRun])

  if (!isLoadingPermissions && !canRead) {
    return <DailyClosingAccessRestricted />
  }

  const status = statusQuery.status

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Cierre diario de cartera
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Consulta el estado operativo y ejecuta el cierre para la fecha vigente.
          </p>
        </div>
      </div>

      {statusQuery.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {statusQuery.error}
        </div>
      ) : null}

      <DailyClosingStatusCards status={status} isLoading={statusQuery.isLoading} />

      {status ? (
        <div className="space-y-3">
          {status.pendingRegisteredPayments > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Hay {status.pendingRegisteredPayments} pagos registrados pendientes. El cierre no
              los efectiviza; ese flujo sigue siendo administrativo separado.
            </div>
          ) : null}
          {status.postingContextStatus !== 'OK' ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
              El periodo contable no permite posteo automatico. Las acciones de ejecucion
              permanecen bloqueadas.
            </div>
          ) : null}
          {status.hasCompletedRunForBusinessDate ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100">
              Ya existe un cierre para la fecha operativa vigente. Para volver a ejecutar
              se usara reproceso con allowReprocess=true.
            </div>
          ) : null}
          {status.hasRunningRun ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              Hay un cierre en ejecucion
              {status.currentRunStatus
                ? ` (${translateRunStatus(status.currentRunStatus)})`
                : ''}.
              Si permanece en este estado por demasiado tiempo, revise el run actual
              antes de intentar un nuevo cierre.
            </div>
          ) : null}
          {status.currentRunHeartbeatAt ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              Ultimo heartbeat: {formatDateTime(status.currentRunHeartbeatAt)}
              {status.currentRunLeaseExpiresAt
                ? ` · Lease hasta ${formatDateTime(status.currentRunLeaseExpiresAt)}`
                : ''}
            </div>
          ) : null}
          {status.recoveryRequired ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
              La ejecucion activa requiere recuperacion. No inicie otro cierre hasta
              resolverla.
            </div>
          ) : null}
        </div>
      ) : null}

      <DailyClosingActionsPanel
        status={status}
        canRun={canRun}
        isLoading={statusQuery.isLoading}
        onRefresh={() => {
          void statusQuery.refresh()
        }}
        onOpenAction={(kind: DailyClosingActionKind) =>
          navigate(`/loans/daily-closing/execute?action=${kind}`)
        }
        onViewHistory={() => navigate('/loans/daily-closing/runs')}
      />
    </div>
  )
}
