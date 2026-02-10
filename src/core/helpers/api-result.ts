import type { AxiosError } from 'axios'

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure<T = unknown> {
  success: false
  error: string
  status?: number
  data?: T
}

export type ApiResult<T, E = unknown> = ApiSuccess<T> | ApiFailure<E>

export const toApiError = <T = unknown>(
  error: unknown,
  fallbackMessage: string,
): ApiFailure<T> => {
  if (isAxiosError(error)) {
    const message = extractAxiosMessage(error, fallbackMessage)
    return {
      success: false,
      error: message,
      status: error.response?.status,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message || fallbackMessage,
    }
  }

  return {
    success: false,
    error: fallbackMessage,
  }
}

const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  )
}

const extractAxiosMessage = (
  error: AxiosError,
  fallbackMessage: string,
): string => {
  const responseData = error.response?.data
  if (typeof responseData === 'string') {
    return responseData
  }

  const problemDetailsMessage = extractProblemDetailsMessage(responseData)
  if (problemDetailsMessage) {
    return problemDetailsMessage
  }

  if (
    responseData &&
    typeof responseData === 'object' &&
    'message' in responseData &&
    typeof (responseData as { message?: unknown }).message === 'string'
  ) {
    return (responseData as { message: string }).message
  }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'error' in responseData &&
    typeof (responseData as { error?: unknown }).error === 'string'
  ) {
    return (responseData as { error: string }).error
  }

  if (error.response?.statusText) {
    return error.response.statusText
  }

  return fallbackMessage
}

const extractProblemDetailsMessage = (responseData: unknown): string | null => {
  if (!responseData || typeof responseData !== 'object') return null

  const maybe = responseData as {
    title?: unknown
    detail?: unknown
    errors?: unknown
  }

  const title = typeof maybe.title === 'string' ? maybe.title.trim() : ''
  const detail = typeof maybe.detail === 'string' ? maybe.detail.trim() : ''
  const validationMessages = extractValidationMessages(maybe.errors)

  const base = detail || title
  if (base && validationMessages.length) {
    return `${base}: ${validationMessages.join(' • ')}`
  }
  if (validationMessages.length) {
    return validationMessages.join(' • ')
  }
  if (base) {
    return base
  }

  return null
}

const extractValidationMessages = (errors: unknown): string[] => {
  if (!errors || typeof errors !== 'object') return []

  const record = errors as Record<string, unknown>
  const messages: string[] = []

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) {
          messages.push(item.trim())
        }
      }
      continue
    }
    if (typeof value === 'string' && value.trim()) {
      messages.push(value.trim())
    }
  }

  return Array.from(new Set(messages))
}
