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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Acciones operativas
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Las ejecuciones usan la fecha operativa vigente y respetan los bloqueos del backend.
          </p>
          {disabledReason ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              {disabledReason}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" />
            Refrescar
          </button>
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            onClick={onViewHistory}
          >
            <History className="h-4 w-4" />
            Ver historial
          </button>
          {actions?.canRecover ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onOpenAction('recover')}
              disabled={isLoading}
            >
              <Wrench className="h-4 w-4" />
              Recuperar ejecucion
            </button>
          ) : null}
          {status?.hasRunningRun && !status.recoveryRequired ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => onOpenAction('run')}
            >
              <Activity className="h-4 w-4" />
              Monitorear ejecucion
            </button>
          ) : null}
          {actions?.canDryRun || actions?.canDryRunReprocess ? (
            <>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onOpenAction('dry-run')}
                disabled={isLoading}
              >
                <PlayCircle className="h-4 w-4" />
                {actions.canDryRunReprocess ? 'Simular reproceso' : 'Simular cierre'}
              </button>
              {actions.canReprocess ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('reprocess')}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reprocesar cierre
                </button>
              ) : actions.canRun ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('run')}
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-4 w-4" />
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
