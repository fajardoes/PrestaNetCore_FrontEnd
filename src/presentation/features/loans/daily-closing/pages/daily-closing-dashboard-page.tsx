import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import { DailyClosingAccessRestricted } from '@/presentation/features/loans/daily-closing/components/daily-closing-access-restricted'
import {
  DailyClosingActionsPanel,
  type DailyClosingActionKind,
} from '@/presentation/features/loans/daily-closing/components/daily-closing-actions-panel'
import { DailyClosingRunActionModal } from '@/presentation/features/loans/daily-closing/components/daily-closing-run-action-modal'
import { DailyClosingRunResultSummary } from '@/presentation/features/loans/daily-closing/components/daily-closing-run-result-summary'
import { DailyClosingStatusCards } from '@/presentation/features/loans/daily-closing/components/daily-closing-status-cards'
import { useDailyClosingRunMutation } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-run-mutation'
import { useDailyClosingStatus } from '@/presentation/features/loans/daily-closing/hooks/use-daily-closing-status'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

export const DailyClosingDashboardPage = () => {
  const navigate = useNavigate()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('loans.daily_closing.read')
  const canRun = hasPermission('loans.daily_closing.run')
  const statusQuery = useDailyClosingStatus(canRead)
  const mutation = useDailyClosingRunMutation()
  const [actionKind, setActionKind] = useState<DailyClosingActionKind | null>(null)
  const [lastResult, setLastResult] = useState<DailyLoanClosingRunResponse | null>(null)

  const handleConfirmAction = async (payload: {
    notes: string | null
    closeBusinessDayOnSuccess: boolean
  }) => {
    const refreshedStatus = await statusQuery.refresh()
    const blockReason = getExecutionBlockReason(refreshedStatus)
    if (blockReason) {
      mutation.setError(blockReason)
      return
    }
    if (actionKind === 'run' && refreshedStatus?.hasCompletedRunForBusinessDate) {
      mutation.setError(
        'Ya existe un cierre completado para la fecha vigente. Use la accion Reprocesar.',
      )
      return
    }

    const result = await mutation.run({
      businessDate: refreshedStatus?.businessDate ?? null,
      allowReprocess: actionKind === 'reprocess',
      dryRun: actionKind === 'dry-run',
      closeBusinessDayOnSuccess:
        actionKind === 'dry-run' ? false : payload.closeBusinessDayOnSuccess,
      notes: payload.notes,
    })

    if (!result) return

    setLastResult(result)
    setActionKind(null)
    await statusQuery.refresh()
  }

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
              Hay {status.pendingRegisteredPayments} pagos REGISTERED pendientes. El cierre no
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
        </div>
      ) : null}

      <DailyClosingActionsPanel
        status={status}
        canRun={canRun}
        isLoading={statusQuery.isLoading || mutation.isLoading}
        onRefresh={() => {
          void statusQuery.refresh()
        }}
        onOpenAction={(kind) => {
          mutation.setError(null)
          setActionKind(kind)
        }}
        onViewHistory={() => navigate('/loans/daily-closing/runs')}
      />

      <DailyClosingRunResultSummary result={lastResult} />

      <DailyClosingRunActionModal
        open={Boolean(actionKind)}
        actionKind={actionKind}
        status={status}
        isProcessing={mutation.isLoading}
        error={mutation.error}
        onCancel={() => {
          mutation.setError(null)
          setActionKind(null)
        }}
        onConfirm={(payload) => {
          void handleConfirmAction(payload)
        }}
      />
    </div>
  )
}

const getExecutionBlockReason = (
  status: DailyLoanClosingStatusResponse | null,
) => {
  if (!status) return 'No se pudo refrescar el estado operativo.'
  if (status.hasRunningRun) return 'Ya existe un cierre en ejecucion.'
  if (!status.isDayOpen) return 'El dia operativo esta cerrado.'
  if (status.postingContextStatus !== 'OK') {
    return 'El periodo contable no esta disponible para posteo automatico.'
  }
  return null
}
