import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFinancialComponentCode,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

export { formatCurrency, formatDate, formatDateTime }

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'BANK_DEPOSIT_PROOF', label: 'Comprobante de depósito bancario' },
  { value: 'BANK_TRANSFER_PROOF', label: 'Comprobante de transferencia bancaria' },
  { value: 'MOBILE_PAYMENT_PROOF', label: 'Comprobante de pago móvil' },
] as const

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'REGISTERED', label: 'Registrado' },
  { value: 'SETTLED', label: 'Liquidado' },
  { value: 'PENDING_REVIEW', label: 'Pendiente de revisión' },
  { value: 'EFFECTIVIZED', label: 'Efectivizado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'REVERSED', label: 'Reversado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const

export const BANK_PAYMENT_TYPE_OPTIONS = PAYMENT_TYPE_OPTIONS.filter(
  (item) => item.value !== 'CASH',
)

export const translatePaymentType = (value?: string | null, fallback?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  const found = PAYMENT_TYPE_OPTIONS.find((item) => item.value === normalized)
  return found?.label ?? fallback?.trim() ?? value?.trim() ?? '—'
}

export const translatePaymentStatus = (
  value?: string | null,
  fallback?: string | null,
) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'REGISTERED') return 'Registrado'
  if (normalized === 'SETTLED') return 'Liquidado'
  if (normalized === 'PENDING_REVIEW') return 'Pendiente de revisión'
  if (normalized === 'EFFECTIVIZED') return 'Efectivizado'
  if (normalized === 'REJECTED') return 'Rechazado'
  if (normalized === 'REVERSED') return 'Reversado'
  if (normalized === 'CANCELLED') return 'Cancelado'
  return fallback?.trim() ?? value?.trim() ?? '—'
}

export const translatePaymentApplicationStatus = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'APPLIED') return 'Aplicado'
  if (normalized === 'PARTIALLY_APPLIED') return 'Aplicado parcialmente'
  if (normalized === 'PENDING_REVIEW') return 'Pendiente de revisión'
  return value?.trim() || '—'
}

export const translatePaymentFlow = (value?: string | null, fallback?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'CASH_COLLECTION') return 'Pago en efectivo'
  if (normalized === 'BANK_PROOF') return 'Abono bancario'
  return fallback?.trim() ?? value?.trim() ?? '—'
}

export const translatePaymentLookupLoanStatus = (
  value?: string | null,
  fallback?: string | null,
) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'ACTIVE') return 'Activo'
  if (normalized === 'DELINQUENT') return 'En mora'
  if (normalized === 'MATURED') return 'Vencido'
  return fallback?.trim() ?? value?.trim() ?? '—'
}

export const translatePaymentLookupInstallmentStatus = (
  value?: string | null,
  fallback?: string | null,
) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'PENDING') return 'Pendiente'
  if (normalized === 'OVERDUE') return 'Vencida'
  if (normalized === 'PAID') return 'Pagada'
  if (normalized === 'PARTIALLY_PAID') return 'Parcialmente pagada'
  return fallback?.trim() ?? value?.trim() ?? '—'
}

export const getPaymentLookupLoanStatusBadgeClass = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
  }
  if (normalized === 'DELINQUENT') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-500/10 dark:text-rose-100'
  }
  if (normalized === 'MATURED') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
}

export const getPaymentLookupInstallmentStatusBadgeClass = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'OVERDUE') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-500/10 dark:text-rose-100'
  }
  if (normalized === 'PENDING') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
  }
  if (normalized === 'PAID') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
  }
  if (normalized === 'PARTIALLY_PAID') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
}

export const getPaymentStatusBadgeClass = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'REGISTERED') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
  }
  if (normalized === 'SETTLED') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
  }
  if (normalized === 'PENDING_REVIEW') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-500/10 dark:text-indigo-100'
  }
  if (normalized === 'EFFECTIVIZED') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
  }
  if (normalized === 'REJECTED') {
    return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100'
  }
  if (normalized === 'REVERSED') {
    return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100'
  }
  if (normalized === 'CANCELLED') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
}

export const getPriorityStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100'

export const formatPaymentComponentLabel = (
  componentCode?: string | null,
  componentName?: string | null,
) => formatFinancialComponentCode(componentCode, componentName)

export const normalizePriorityDraftOrders = (
  items: PaymentComponentPriorityResponse[],
) =>
  items.map((item, index) => ({
    id: item.id,
    priorityOrder: (index + 1) * 10,
  }))

export const buildPriorityReorderPayload = (
  items: PaymentComponentPriorityResponse[],
) => ({
  items: normalizePriorityDraftOrders(items),
})

export const sumPaymentAllocations = (payment?: PaymentResponse | null) =>
  (payment?.allocations ?? []).reduce((sum, allocation) => sum + allocation.amount, 0)

export const formatBankEntityDisplay = (
  code?: string | null,
  name?: string | null,
  fallback = '—',
) => {
  const normalizedCode = code?.trim() || ''
  const normalizedName = name?.trim() || ''
  if (!normalizedCode && !normalizedName) return fallback
  if (normalizedCode && normalizedName) return `${normalizedCode} - ${normalizedName}`
  return normalizedCode || normalizedName || fallback
}

export const isPaymentReceiptPrintable = (payment?: PaymentResponse | null) => {
  const flow = payment?.paymentFlowCode?.trim().toUpperCase()
  const status = payment?.statusCode?.trim().toUpperCase()
  if (flow === 'CASH_COLLECTION') return status === 'REGISTERED' || status === 'SETTLED'
  if (flow === 'BANK_PROOF') return status === 'EFFECTIVIZED'
  return Boolean(payment?.internalReceiptNumber) && status !== 'REVERSED'
}
