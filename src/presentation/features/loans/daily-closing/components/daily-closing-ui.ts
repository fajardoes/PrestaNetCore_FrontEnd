import type {
  DailyClosingProcessCode,
  DailyClosingProcessingStatus,
} from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'
import type { DailyClosingRunStatus } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'
import type { SelectOption } from '@/presentation/share/components/select'

export const DAILY_CLOSING_RUN_STATUS_OPTIONS: Array<
  SelectOption<DailyClosingRunStatus>
> = [
  { value: 'RUNNING', label: 'En ejecucion', meta: 'RUNNING' },
  { value: 'COMPLETED', label: 'Completado', meta: 'COMPLETED' },
  {
    value: 'COMPLETED_WITH_ERRORS',
    label: 'Completado con errores',
    meta: 'COMPLETED_WITH_ERRORS',
  },
  { value: 'FAILED', label: 'Fallido', meta: 'FAILED' },
  { value: 'COMPENSATED', label: 'Compensado', meta: 'COMPENSATED' },
  {
    value: 'DRY_RUN_COMPLETED',
    label: 'Simulacion completada',
    meta: 'DRY_RUN_COMPLETED',
  },
  {
    value: 'DRY_RUN_COMPLETED_WITH_ERRORS',
    label: 'Simulacion con errores',
    meta: 'DRY_RUN_COMPLETED_WITH_ERRORS',
  },
]

export const DAILY_CLOSING_PROCESS_OPTIONS: Array<
  SelectOption<DailyClosingProcessCode>
> = [
  {
    value: 'INTEREST_ACCRUAL',
    label: 'Devengo de intereses',
    meta: 'INTEREST_ACCRUAL',
  },
  {
    value: 'DEFERRED_FEE_RECOGNITION',
    label: 'Reconocimiento de cargos diferidos',
    meta: 'DEFERRED_FEE_RECOGNITION',
  },
  {
    value: 'INSTALLMENT_STATUS_REFRESH',
    label: 'Refresco de cuotas',
    meta: 'INSTALLMENT_STATUS_REFRESH',
  },
  {
    value: 'DELINQUENCY_ACCRUAL',
    label: 'Calculo de mora diaria',
    meta: 'DELINQUENCY_ACCRUAL',
  },
  { value: 'SNAPSHOT', label: 'Snapshot diario', meta: 'SNAPSHOT' },
  { value: 'FINAL_VALIDATION', label: 'Validacion final', meta: 'FINAL_VALIDATION' },
]

export const DAILY_CLOSING_PROCESSING_STATUS_OPTIONS: Array<
  SelectOption<DailyClosingProcessingStatus>
> = [
  { value: 'PENDING', label: 'Pendiente', meta: 'PENDING' },
  { value: 'PROCESSED', label: 'Procesado', meta: 'PROCESSED' },
  { value: 'SKIPPED', label: 'Omitido', meta: 'SKIPPED' },
  { value: 'FAILED', label: 'Fallido', meta: 'FAILED' },
]

export const translateRunStatus = (status?: DailyClosingRunStatus | null) => {
  if (!status) return 'Sin run activo'
  return (
    DAILY_CLOSING_RUN_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  )
}

export const translateProcessCode = (code: DailyClosingProcessCode) =>
  DAILY_CLOSING_PROCESS_OPTIONS.find((option) => option.value === code)?.label ?? code

export const translateProcessingStatus = (status: DailyClosingProcessingStatus) =>
  DAILY_CLOSING_PROCESSING_STATUS_OPTIONS.find((option) => option.value === status)
    ?.label ?? status

export const getRunStatusBadgeClass = (status?: DailyClosingRunStatus | null) => {
  switch (status) {
    case 'COMPLETED':
      return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100'
    case 'COMPLETED_WITH_ERRORS':
    case 'DRY_RUN_COMPLETED_WITH_ERRORS':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
    case 'FAILED':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100'
    case 'RUNNING':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100'
    case 'DRY_RUN_COMPLETED':
      return 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100'
    case 'COMPENSATED':
      return 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
  }
}

export const getProcessingStatusBadgeClass = (
  status: DailyClosingProcessingStatus,
) => {
  switch (status) {
    case 'PROCESSED':
      return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100'
    case 'FAILED':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100'
    case 'SKIPPED':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
    case 'PENDING':
      return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
  }
}

export const formatDateOnly = (value?: string | null) => value?.slice(0, 10) || '-'

export const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export const formatDuration = (value?: number | null) => {
  if (value === null || value === undefined) return '-'
  if (value < 1000) return `${value} ms`
  const seconds = value / 1000
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes} min ${remainingSeconds} s`
}

export const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat('es-HN').format(value ?? 0)

export const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(value)
}

export const runHasErrors = (status?: DailyClosingRunStatus | null) =>
  status === 'FAILED' ||
  status === 'COMPLETED_WITH_ERRORS' ||
  status === 'DRY_RUN_COMPLETED_WITH_ERRORS'
