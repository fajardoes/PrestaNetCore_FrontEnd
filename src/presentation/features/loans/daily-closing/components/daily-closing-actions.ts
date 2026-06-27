import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

export interface DailyClosingActions {
  canRun: boolean
  canDryRun: boolean
  canReprocess: boolean
  canDryRunReprocess: boolean
  canRecover: boolean
  blockReason?: string
}

const blockedActions: DailyClosingActions = {
  canRun: false,
  canDryRun: false,
  canReprocess: false,
  canDryRunReprocess: false,
  canRecover: false,
}

export const resolveDailyClosingActions = (
  status: DailyLoanClosingStatusResponse,
  canWrite: boolean,
): DailyClosingActions => {
  if (!canWrite) {
    return { ...blockedActions, blockReason: 'Sin permiso de ejecucion.' }
  }

  if (status.recoveryRequired) {
    return {
      ...blockedActions,
      canRecover: Boolean(status.currentRunId),
      blockReason: 'La ejecucion activa requiere recuperacion.',
    }
  }

  if (status.hasRunningRun) {
    return { ...blockedActions, blockReason: 'Existe un cierre en ejecucion.' }
  }

  if (!status.isDayOpen) {
    return { ...blockedActions, blockReason: 'El dia operativo esta cerrado.' }
  }

  if (status.postingContextStatus !== 'OK') {
    return {
      ...blockedActions,
      blockReason:
        status.postingContextStatus ?? 'El periodo contable no permite posteo.',
    }
  }

  if (status.hasCompletedRunForBusinessDate) {
    return {
      ...blockedActions,
      canReprocess: true,
      canDryRunReprocess: true,
    }
  }

  return {
    ...blockedActions,
    canRun: true,
    canDryRun: true,
  }
}
