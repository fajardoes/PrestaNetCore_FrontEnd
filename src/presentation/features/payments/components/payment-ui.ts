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
  { value: 'EFFECTIVIZED', label: 'Efectivizado' },
  { value: 'REVERSED', label: 'Reversado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const

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
  if (normalized === 'EFFECTIVIZED') return 'Efectivizado'
  if (normalized === 'REVERSED') return 'Reversado'
  if (normalized === 'CANCELLED') return 'Cancelado'
  return fallback?.trim() ?? value?.trim() ?? '—'
}

export const translatePaymentApplicationStatus = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'APPLIED') return 'Aplicado'
  if (normalized === 'PARTIALLY_APPLIED') return 'Aplicado parcialmente'
  return value?.trim() || '—'
}

export const getPaymentStatusBadgeClass = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'REGISTERED') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
  }
  if (normalized === 'EFFECTIVIZED') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
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
