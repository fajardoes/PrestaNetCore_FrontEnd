const roundDecimal = (value: number, precision = 12) => {
  if (!Number.isFinite(value)) return value
  return Number(value.toFixed(precision))
}

const rateToPercent = (value: number) => {
  if (!Number.isFinite(value)) return value
  return Math.abs(value) <= 1 ? roundDecimal(value * 100) : roundDecimal(value)
}

export const mapRateToPercentValue = (value: number) => rateToPercent(value)

export const mapPercentInputToRate = (value: number) => {
  if (!Number.isFinite(value)) return value
  return roundDecimal(value / 100)
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
