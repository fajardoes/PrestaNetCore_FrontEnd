import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

const formatNumber = (value: number, minimumFractionDigits = 2, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('es-HN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)

export const formatCurrencyAmount = (value?: number | null) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'L 0.00'
  return `L ${formatNumber(value)}`
}

export const formatInsuranceValue = (
  value?: number | null,
  valueTypeCode?: string | null,
) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'

  const normalizedCode = (valueTypeCode ?? '').trim().toUpperCase()
  if (normalizedCode === 'PERCENTAGE') {
    return `${formatNumber(value, 0, 4)}%`
  }

  if (normalizedCode === 'FIXED_AMOUNT') {
    return formatCurrencyAmount(value)
  }

  return formatNumber(value)
}

export const getCatalogItemCodeById = (
  items: LoanCatalogItemDto[],
  id?: string | null,
) => {
  if (!id) return null
  return items.find((item) => item.id === id)?.code ?? null
}
