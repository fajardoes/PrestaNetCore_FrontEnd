import type { AxiosError } from 'axios'

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure<T = undefined> {
  success: false
  error: string
  status?: number
  data?: T
}

export type ApiResult<T, E = undefined> = ApiSuccess<T> | ApiFailure<E>

export const toApiError = <T = undefined>(
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

  if (
    responseData &&
    typeof responseData === 'object' &&
    'message' in responseData &&
    typeof (responseData as { message?: unknown }).message === 'string'
  ) {
    return (responseData as { message: string }).message
  }

  if (error.response?.statusText) {
    return error.response.statusText
  }

  return fallbackMessage
}
