import { useCallback, useState } from 'react'
import { resolveDelinquencyPolicyAction } from '@/core/actions/loans-delinquency-policy/resolve-delinquency-policy.action'
import type { ResolveDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/resolve-delinquency-policy.request'
import type { ResolveDelinquencyPolicyResponseDto } from '@/infrastructure/intranet/responses/loans/resolve-delinquency-policy.response'
import type { ApiResult } from '@/core/helpers/api-result'

interface ResolveDelinquencyPolicyState {
  data: ResolveDelinquencyPolicyResponseDto | null
  isLoading: boolean
  error: string | null
  status?: number
}

const mapResolveError = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 404) {
    return 'No existe política global activa para resolver.'
  }
  if (result.status === 400) {
    const detail = result.error?.trim()
    return detail
      ? `Validación: ${detail}`
      : 'Validación: revisa los datos ingresados.'
  }
  return result.error
}

export const useResolveDelinquencyPolicy = () => {
  const [state, setState] = useState<ResolveDelinquencyPolicyState>({
    data: null,
    isLoading: false,
    error: null,
    status: undefined,
  })

  const resolve = useCallback(
    async (payload: ResolveDelinquencyPolicyRequestDto) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await resolveDelinquencyPolicyAction(payload)
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null })
        return result
      }
      setState({
        data: null,
        isLoading: false,
        error: mapResolveError(result),
        status: result.status,
      })
      return result
    },
    [],
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, status: undefined })
  }, [])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    status: state.status,
    resolve,
    reset,
  }
}
