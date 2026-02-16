const rateToPercent = (value: number) => {
  if (!Number.isFinite(value)) return value
  return Math.abs(value) <= 1 ? value * 100 : value
}

export const mapRateToPercentValue = (value: number) => rateToPercent(value)

export const mapPercentInputToRate = (value: number) => {
  if (!Number.isFinite(value)) return value
  return value / 100
}

export const formatRateAsPercent = (
  value?: number | null,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  },
) => {
  if (value === null || value === undefined) return '—'
  const normalized = rateToPercent(value)
  return `${new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(normalized)}%`
}
