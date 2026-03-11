import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

export const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatCurrency = (value?: number | null) =>
  value === null || value === undefined ? '—' : `L ${formatMoney(value)}`

export const formatPercentValue = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `${formatMoney(value)}%`
}

export const formatInterestCalculationMethod = (value?: string | null) => {
  const normalized = (value ?? '').trim().toLowerCase()
  if (!normalized) return '—'
  if (normalized === 'interest_by_days') return 'Interés por días'
  if (normalized === 'interest_by_period') return 'Interés por período'
  if (normalized === 'flat') return 'Interés fijo'
  if (normalized.includes('day')) return 'Interés por días'
  if (normalized.includes('period')) return 'Interés por período'
  if (normalized.includes('flat') || normalized.includes('fixed interest')) return 'Interés fijo'

  return normalized.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export const formatRatio = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatYesNo = (value?: boolean | null) => (value ? 'Sí' : 'No')

export const formatChargeTypeCode = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'FEE') return 'Comisión'
  if (normalized === 'INSURANCE') return 'Seguro'
  return value?.trim() || '—'
}

export const formatChargeRateOrValue = (
  value?: number | null,
  valueTypeCode?: string | null,
) => {
  const normalized = (valueTypeCode ?? '').trim().toUpperCase()
  if (normalized === 'PERCENTAGE') return formatPercentValue(value)
  if (normalized === 'FIXED_AMOUNT') return formatCurrency(value)
  return value === null || value === undefined ? '—' : formatMoney(value)
}

export const formatChargeTimingCode = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'DISBURSEMENT') return 'Al desembolso'
  return value?.trim() || '—'
}

export const formatDisbursementChargeSource = (
  sourceType?: string | null,
) => {
  const normalized = (sourceType ?? '').trim().toUpperCase()
  if (normalized === 'LOAN_PRODUCT_FEE') return 'Comisión configurada'
  if (normalized === 'LOAN_PRODUCT_INSURANCE') return 'Seguro configurado'
  if (normalized === 'FEE') return 'Comisión configurada'
  if (normalized === 'INSURANCE') return 'Seguro configurado'
  return 'Cargo configurado'
}

export const translateRecognitionPolicy = (
  value?: string | null,
  type: 'interest' | 'fee' = 'interest',
) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (!normalized) return 'No definida'
  if (normalized === 'ACCRUAL_ON_DUE') return 'Devengo al vencimiento'
  if (normalized === 'STRAIGHT_LINE') return 'Reconocimiento lineal'
  if (type === 'interest' && normalized === 'ACCRUAL_DAILY') return 'Devengo diario'
  return normalized.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export const hasDisbursementData = (value: {
  grossDisbursementAmount?: number | null
  totalDisbursementFees?: number | null
  totalDisbursementInsurance?: number | null
  netDisbursementAmount?: number | null
  disbursementJournalEntryId?: string | null
}) =>
  value.grossDisbursementAmount != null ||
  value.totalDisbursementFees != null ||
  value.totalDisbursementInsurance != null ||
  value.netDisbursementAmount != null ||
  Boolean(value.disbursementJournalEntryId?.trim())

export const translateLoanApplicationStatus = (
  statusCode?: string | null,
  statusName?: string | null,
) => {
  const normalized = (statusCode ?? '').trim().toUpperCase()
  if (normalized === 'DRAFT') return 'Borrador'
  if (normalized === 'SUBMITTED') return 'Enviada'
  if (normalized === 'APPROVED') return 'Aprobada'
  if (normalized === 'DISBURSED') return 'Desembolsada'
  if (normalized === 'REJECTED') return 'Rechazada'
  if (normalized === 'CANCELLED') return 'Cancelada'
  return statusName?.trim() || statusCode || '—'
}

export const statusBadgeClass = (statusCode?: string | null) => {
  const normalized = (statusCode ?? '').toUpperCase()
  if (normalized === 'DRAFT') {
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
  }
  if (normalized === 'SUBMITTED') {
    return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:ring-sky-500/40'
  }
  if (normalized === 'APPROVED') {
    return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/40'
  }
  if (normalized === 'DISBURSED') {
    return 'bg-teal-100 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/20 dark:text-teal-200 dark:ring-teal-500/40'
  }
  if (normalized === 'REJECTED') {
    return 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-500/40'
  }
  if (normalized === 'CANCELLED') {
    return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-500/40'
  }
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
}

export const financialProfileBadgeClass = (hasFinancialProfile?: boolean | null) =>
  hasFinancialProfile
    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
    : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'

export const financialProfileCompletenessBadgeClass = (isComplete?: boolean | null) =>
  isComplete
    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
    : 'bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-500/40'

export const applyFinancialProfileSnapshot = (
  application: LoanApplicationResponse,
  profile: LoanApplicationFinancialProfileResponse,
): LoanApplicationResponse => ({
  ...application,
  hasFinancialProfile: true,
  isFinancialProfileComplete: profile.isComplete,
  financialProfileUpdatedAt:
    profile.updatedAt ?? profile.createdAt ?? application.financialProfileUpdatedAt ?? null,
  financialDebtRatio: profile.debtRatio ?? null,
  financialDebtToEquityRatio: profile.debtToEquityRatio ?? null,
})
