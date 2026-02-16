export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

export const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const statusBadgeClass = (statusCode?: string | null) => {
  const normalized = (statusCode ?? '').toUpperCase()
  if (normalized === 'DRAFT') {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }
  if (normalized === 'SUBMITTED') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
  }
  if (normalized === 'APPROVED') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
  }
  if (normalized === 'REJECTED') {
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200'
  }
  if (normalized === 'CANCELLED') {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
}
