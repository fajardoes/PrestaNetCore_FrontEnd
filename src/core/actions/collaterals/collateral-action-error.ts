import type { ApiFailure } from '@/core/helpers/api-result'
import { toApiError } from '@/core/helpers/api-result'

export interface CollateralActionErrorData {
  errorsByField?: Record<string, string[]>
}

interface ProblemDetailsLike {
  title?: string
  detail?: string
  errors?: Record<string, string[] | string>
}

export const toCollateralApiError = (
  error: unknown,
  fallbackMessage: string,
): ApiFailure<CollateralActionErrorData> => {
  const raw = toApiError(error, fallbackMessage)
  const normalized: ApiFailure<CollateralActionErrorData> = {
    success: false,
    error: raw.error,
    status: raw.status,
  }

  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return normalized
  }

  const response = (error as { response?: { data?: unknown } }).response
  const data = response?.data

  if (!data || typeof data !== 'object') {
    return normalized
  }

  const details = data as ProblemDetailsLike
  const errorsByField = mapErrorsByField(details.errors)
  if (!errorsByField) {
    return normalized
  }

  return {
    ...normalized,
    data: {
      errorsByField,
    },
  }
}

const mapErrorsByField = (
  errors: ProblemDetailsLike['errors'],
): Record<string, string[]> | undefined => {
  if (!errors || typeof errors !== 'object') return undefined

  const entries = Object.entries(errors).reduce<Record<string, string[]>>(
    (acc, [key, value]) => {
      if (Array.isArray(value)) {
        const cleaned = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
        if (cleaned.length) {
          acc[key] = cleaned
        }
        return acc
      }

      if (typeof value === 'string' && value.trim()) {
        acc[key] = [value.trim()]
      }

      return acc
    },
    {},
  )

  return Object.keys(entries).length ? entries : undefined
}
