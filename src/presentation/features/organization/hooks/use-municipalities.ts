import { useCallback, useEffect, useState } from 'react'
import { listMunicipalitiesAction } from '@/core/actions/geography/list-municipalities.action'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'

interface UseMunicipalitiesState {
  municipalities: Municipality[]
  isLoading: boolean
  error: string | null
}

export const useMunicipalities = (options?: {
  departmentId?: string
  enabled?: boolean
}) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseMunicipalitiesState>({
    municipalities: [],
    isLoading: false,
    error: null,
  })

  const fetchMunicipalities = useCallback(async () => {
    if (!enabled) {
      setState({ municipalities: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listMunicipalitiesAction(options?.departmentId)
    if (result.success) {
      setState({
        municipalities: result.data,
        isLoading: false,
        error: null,
      })
    } else {
      setState({ municipalities: [], isLoading: false, error: result.error })
    }
  }, [options?.departmentId, enabled])

  useEffect(() => {
    void fetchMunicipalities()
  }, [fetchMunicipalities])

  return {
    municipalities: state.municipalities,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchMunicipalities,
  }
}
