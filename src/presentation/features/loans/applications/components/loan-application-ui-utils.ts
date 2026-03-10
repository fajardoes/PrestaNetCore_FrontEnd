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

export const formatRatio = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const translateLoanApplicationStatus = (
  statusCode?: string | null,
  statusName?: string | null,
) => {
  const normalized = (statusCode ?? '').trim().toUpperCase()
  if (normalized === 'DRAFT') return 'Borrador'
  if (normalized === 'SUBMITTED') return 'Enviada'
  if (normalized === 'APPROVED') return 'Aprobada'
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
