import { useCallback, useEffect, useState } from 'react'
import { listAgenciesAction } from '@/core/actions/catalog/list-agencies.action'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

interface UseAgenciesState {
  agencies: Agency[]
  isLoading: boolean
  error: string | null
}

export const useAgencies = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseAgenciesState>({
    agencies: [],
    isLoading: false,
    error: null,
  })

  const fetchAgencies = useCallback(async () => {
    if (!enabled) {
      setState({ agencies: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listAgenciesAction()
    if (result.success) {
      setState({
        agencies: result.data,
        isLoading: false,
        error: null,
      })
    } else {
      setState({ agencies: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchAgencies()
  }, [fetchAgencies])

  return {
    agencies: state.agencies,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchAgencies,
  }
}
