import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

type ScoringUiVariant = 'success' | 'warning' | 'danger' | 'neutral'

const variantClasses: Record<ScoringUiVariant, string> = {
  success:
    'border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
  warning:
    'border-amber-200/80 bg-amber-50/80 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  danger:
    'border-rose-200/80 bg-rose-50/80 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
  neutral:
    'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
}

const factorVariantClasses: Record<ScoringUiVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10',
  warning:
    'border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10',
  danger:
    'border-rose-200 bg-rose-50/80 dark:border-rose-500/30 dark:bg-rose-500/10',
  neutral:
    'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
}

const unitLabels: Record<string, string> = {
  percent: '%',
}

const normalizeVariant = (value?: string | null): ScoringUiVariant => {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'success') return 'success'
  if (normalized === 'warning') return 'warning'
  if (normalized === 'danger') return 'danger'
  return 'neutral'
}

const hexToRgba = (value: string, alpha: number) => {
  const normalized = value.trim().replace('#', '')
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return undefined

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const numberFormatter = new Intl.NumberFormat('es-HN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const compactNumberFormatter = new Intl.NumberFormat('es-HN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const formatLoanApplicationScore = (value?: number | null) => {
  if (value == null) return '—'
  return numberFormatter.format(value)
}

export const formatLoanApplicationScoringDateTime = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export const formatLoanApplicationScoringDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'medium',
  }).format(parsed)
}

export const resolveLoanApplicationScoringVariantClasses = (
  uiVariant?: string | null,
) => variantClasses[normalizeVariant(uiVariant)]

export const resolveLoanApplicationScoringFactorClasses = (
  uiVariant?: string | null,
) => factorVariantClasses[normalizeVariant(uiVariant)]

export const resolveLoanApplicationScoringBadgeStyle = (
  scoring?: Pick<LoanApplicationCreditScoreResponse, 'colorHex' | 'colorHexDark'> | null,
) => {
  if (!scoring) return undefined

  return {
    borderColor: hexToRgba(scoring.colorHex, 0.45),
    backgroundColor: hexToRgba(scoring.colorHex, 0.12),
    color: scoring.colorHex,
  }
}

export const resolveLoanApplicationScoringCardStyle = (
  scoring?: Pick<LoanApplicationCreditScoreResponse, 'colorHex' | 'colorHexDark'> | null,
) => {
  if (!scoring) return undefined

  return {
    borderColor: hexToRgba(scoring.colorHex, 0.35),
    background: `linear-gradient(135deg, ${hexToRgba(scoring.colorHex, 0.18) ?? 'transparent'} 0%, ${hexToRgba(scoring.colorHexDark, 0.14) ?? 'transparent'} 100%)`,
  }
}

export const formatLoanApplicationScoringMetricValue = (
  metricValue?: number | null,
  metricText?: string | null,
  unit?: string | null,
) => {
  if (metricValue != null) {
    const normalizedUnit = (unit ?? '').trim().toLowerCase()
    const value = compactNumberFormatter.format(metricValue)
    const unitLabel = unitLabels[normalizedUnit] ?? unit?.trim()
    return unitLabel ? `${value} ${unitLabel}` : value
  }

  if (metricText?.trim()) return metricText.trim()

  return '—'
}

export const resolveLoanApplicationScoringLabel = (
  value?: string | null,
  fallback?: string | null,
) => value?.trim() || fallback?.trim() || '—'
