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
  { value: 'REVERSED', label: 'Revertido' },
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
  if (normalized === 'REVERSED') return 'Revertido'
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
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
  }
  if (normalized === 'REVERSED') {
    return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
}

export const getPriorityStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100'
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
