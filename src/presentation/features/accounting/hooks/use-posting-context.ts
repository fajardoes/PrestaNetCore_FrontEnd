import { useCallback, useEffect, useState } from 'react'
import { getPostingContextAction } from '@/core/actions/accounting/get-posting-context.action'
import type { AccountingPostingContext } from '@/infrastructure/interfaces/accounting/accounting-period'

interface UsePostingContextState {
  data: AccountingPostingContext | null
  isLoading: boolean
  error: string | null
}

export const usePostingContext = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UsePostingContextState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState({ data: null, isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getPostingContextAction()

    if (result.success) {
      setState({ data: result.data, isLoading: false, error: null })
      return
    }

    setState({ data: null, isLoading: false, error: result.error })
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    postingContext: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  }
}
