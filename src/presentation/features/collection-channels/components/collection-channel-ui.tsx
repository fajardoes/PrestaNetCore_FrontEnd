import type { CollectionChannelExposureResponse } from '@/infrastructure/collection-channels/responses/collection-channel-exposure-response'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/collection-channel-user-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

const percentageFormatter = new Intl.NumberFormat('es-HN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const formatChannelMoney = (value?: number | null, currencyCode = 'HNL') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const normalizedCurrencyCode = currencyCode?.trim().toUpperCase() || 'HNL'

  try {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: normalizedCurrencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
}

export const formatChannelDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-HN')
}

export const toChannelTypeLabel = (
  value?: string | null,
  channelTypes?: CollectionChannelTypeResponse[],
) => {
  if (!value) return '—'
  const normalized = value.trim().toUpperCase()
  const found = channelTypes?.find((item) => item.code.trim().toUpperCase() === normalized)
  if (found?.name?.trim()) return found.name
  return normalized
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export const resolveChannelUtilization = (
  source: Pick<
    CollectionChannelResponse,
    'currentOutstandingAmount' | 'maxOutstandingAmount' | 'isLimitExceeded'
  >,
) => {
  if (!source.maxOutstandingAmount || source.maxOutstandingAmount <= 0) {
    return source.currentOutstandingAmount > 0 ? 100 : 0
  }
  return Number(
    ((source.currentOutstandingAmount / source.maxOutstandingAmount) * 100).toFixed(2),
  )
}

export const resolveUserOutstandingUtilization = (
  source: Pick<
    CollectionChannelUserResponse,
    'currentOutstandingAmount' | 'maxOutstandingAmount' | 'isLimitExceeded'
  >,
) => {
  if (!source.maxOutstandingAmount || source.maxOutstandingAmount <= 0) {
    return source.currentOutstandingAmount > 0 ? 100 : 0
  }
  return Number(
    ((source.currentOutstandingAmount / source.maxOutstandingAmount) * 100).toFixed(2),
  )
}

export const getExposureTone = (
  utilizationPercentage: number,
  isLimitExceeded = false,
) => {
  if (isLimitExceeded || utilizationPercentage >= 100) return 'critical'
  if (utilizationPercentage >= 90) return 'critical'
  if (utilizationPercentage >= 70) return 'warning'
  return 'normal'
}

export const getExposureBadgeClass = (
  utilizationPercentage: number,
  isLimitExceeded = false,
) => {
  const tone = getExposureTone(utilizationPercentage, isLimitExceeded)
  if (tone === 'critical') {
    return 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
  }
  if (tone === 'warning') {
    return 'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40'
  }
  return 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
}

export const getExposureBarClass = (
  utilizationPercentage: number,
  isLimitExceeded = false,
) => {
  const tone = getExposureTone(utilizationPercentage, isLimitExceeded)
  if (tone === 'critical') return 'bg-red-500'
  if (tone === 'warning') return 'bg-amber-500'
  return 'bg-sky-500'
}

export const getChannelStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
    : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'

export const getExposureSummary = (
  exposure: CollectionChannelExposureResponse | null,
  fallbackChannel?: CollectionChannelResponse | null,
) => {
  if (exposure) {
    return {
      currentOutstandingAmount: exposure.currentOutstandingAmount,
      maxOutstandingAmount: exposure.maxOutstandingAmount,
      availableOutstandingAmount: exposure.availableOutstandingAmount,
      activeUsersCount: exposure.activeUsersCount,
      utilizationPercentage: exposure.utilizationPercentage,
      currencyCode: exposure.currencyCode,
      isActive: exposure.isActive,
      isLimitExceeded: exposure.utilizationPercentage >= 100,
    }
  }

  if (fallbackChannel) {
    return {
      currentOutstandingAmount: fallbackChannel.currentOutstandingAmount,
      maxOutstandingAmount: fallbackChannel.maxOutstandingAmount,
      availableOutstandingAmount: fallbackChannel.availableOutstandingAmount,
      activeUsersCount: fallbackChannel.activeUsersCount,
      utilizationPercentage: resolveChannelUtilization(fallbackChannel),
      currencyCode: fallbackChannel.currencyCode,
      isActive: fallbackChannel.isActive,
      isLimitExceeded: fallbackChannel.isLimitExceeded,
    }
  }

  return null
}

export const formatUtilization = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${percentageFormatter.format(value)}%`
}
