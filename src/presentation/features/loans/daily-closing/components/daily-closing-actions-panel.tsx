import {
  Activity,
  History,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import { resolveDailyClosingActions } from './daily-closing-actions'

type DailyClosingActionKind = 'dry-run' | 'run' | 'reprocess' | 'recover'

interface DailyClosingActionsPanelProps {
  status: DailyLoanClosingStatusResponse | null
  canRun: boolean
  isLoading?: boolean
  onRefresh: () => void
  onOpenAction: (kind: DailyClosingActionKind) => void
  onViewHistory: () => void
}

export const DailyClosingActionsPanel = ({
  status,
  canRun,
  isLoading,
  onRefresh,
  onOpenAction,
  onViewHistory,
}: DailyClosingActionsPanelProps) => {
  const actions = status
    ? resolveDailyClosingActions(status, canRun)
    : null
  const disabledReason = actions?.blockReason ?? (!status ? 'No se ha cargado el estado operativo.' : null)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Acciones operativas
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            Las ejecuciones usan la fecha operativa vigente y respetan los bloqueos del backend.
          </p>
          {disabledReason ? (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              {disabledReason}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refrescar
          </button>
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={onViewHistory}
          >
            <History className="h-3.5 w-3.5" />
            Ver historial
          </button>
          {actions?.canRecover ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onOpenAction('recover')}
              disabled={isLoading}
            >
              <Wrench className="h-3.5 w-3.5" />
              Recuperar ejecucion
            </button>
          ) : null}
          {status?.hasRunningRun && !status.recoveryRequired ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              onClick={() => onOpenAction('run')}
            >
              <Activity className="h-3.5 w-3.5" />
              Monitorear ejecucion
            </button>
          ) : null}
          {actions?.canDryRun || actions?.canDryRunReprocess ? (
            <>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onOpenAction('dry-run')}
                disabled={isLoading}
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {actions.canDryRunReprocess ? 'Simular reproceso' : 'Simular cierre'}
              </button>
              {actions.canReprocess ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('reprocess')}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reprocesar cierre
                </button>
              ) : actions.canRun ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('run')}
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {status?.currentRunStatus === 'ABANDONED'
                    ? 'Reprocesar cierre'
                    : 'Ejecutar cierre'}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export type { DailyClosingActionKind }
