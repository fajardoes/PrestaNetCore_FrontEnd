import type { AnticipatedInstallmentStatusCode } from '@/infrastructure/loans/responses/anticipated-installment-response'

export const anticipatedInstallmentStatusLabel = (code: string, fallback?: string | null) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCOUNTED: 'Contabilizada',
    PARTIALLY_APPLIED: 'Aplicada parcialmente',
    FULLY_APPLIED: 'Aplicada totalmente',
    CANCELLED: 'Cancelada',
    REVERSED: 'Reversada',
    APPLIED: 'Aplicada',
  }
  return labels[code.trim().toUpperCase()] ?? fallback?.trim() ?? code
}

export const anticipatedInstallmentStatusClass = (code: string) => {
  const normalized = code.trim().toUpperCase() as AnticipatedInstallmentStatusCode
  if (normalized === 'PENDING') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
  }
  if (normalized === 'ACCOUNTED' || normalized === 'PARTIALLY_APPLIED') {
    return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200'
  }
  if (normalized === 'FULLY_APPLIED') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
}

export const anticipatedInstallmentEventLabel = (code: string) => {
  const labels: Record<string, string> = {
    CREATED: 'Registrada',
    UPDATED: 'Actualizada',
    REACTIVATED: 'Reactivada',
    CANCELLED: 'Cancelada',
    ACCOUNTED_ON_DISBURSEMENT: 'Contabilizada al desembolso',
    PARTIALLY_APPLIED: 'Aplicación parcial',
    FULLY_APPLIED: 'Aplicación total',
    APPLICATION_REVERSED: 'Aplicación reversada',
    DISBURSEMENT_REVERSED: 'Desembolso reversado',
  }
  return labels[code.trim().toUpperCase()] ?? code
}

export const formatAnticipatedInstallmentDate = (value?: string | null) => {
  if (!value) return '—'
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) {
    const localDate = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    return localDate.toLocaleDateString('es-HN')
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('es-HN')
}

export const anticipatedInstallmentStrategyLabel = (code: string, fallback?: string | null) => {
  const labels: Record<string, string> = {
    LOWEST_OF_AMOUNT_OR_PERCENTAGE: 'Menor entre monto y porcentaje',
    FIXED_AMOUNT: 'Monto máximo fijo',
    PERCENTAGE_OF_APPROVED_AMOUNT: 'Porcentaje del monto aprobado',
  }
  return labels[code.trim().toUpperCase()] ?? fallback?.trim() ?? code
}
