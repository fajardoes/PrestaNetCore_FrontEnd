import { History, PlayCircle, RefreshCcw, RotateCcw, ShieldCheck } from 'lucide-react'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

type DailyClosingActionKind = 'dry-run' | 'run' | 'reprocess'

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
  const disabledReason = getExecutionDisabledReason(status)
  const executionDisabled = Boolean(disabledReason) || isLoading

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
          {canRun ? (
            <>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onOpenAction('dry-run')}
                disabled={executionDisabled}
                title={disabledReason ?? 'Simular cierre'}
              >
                <PlayCircle className="h-4 w-4" />
                Simular cierre
              </button>
              {status?.hasCompletedRunForBusinessDate ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('reprocess')}
                  disabled={executionDisabled}
                  title={disabledReason ?? 'Reprocesar cierre'}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reprocesar cierre
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => onOpenAction('run')}
                  disabled={executionDisabled}
                  title={disabledReason ?? 'Ejecutar cierre'}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Ejecutar cierre
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const getExecutionDisabledReason = (
  status: DailyLoanClosingStatusResponse | null,
) => {
  if (!status) return 'No se ha cargado el estado operativo.'
  if (status.hasRunningRun) return 'Ya existe un cierre en ejecucion.'
  if (!status.isDayOpen) return 'El dia operativo esta cerrado.'
  if (status.postingContextStatus !== 'OK') {
    return 'El periodo contable no esta disponible para posteo automatico.'
  }
  return null
}

export type { DailyClosingActionKind }
