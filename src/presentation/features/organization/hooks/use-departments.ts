import { useCallback, useEffect, useState } from 'react'
import { listDepartmentsAction } from '@/core/actions/geography/list-departments.action'
import type { Department } from '@/infrastructure/interfaces/organization/geography'

interface UseDepartmentsState {
  departments: Department[]
  isLoading: boolean
  error: string | null
}

export const useDepartments = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseDepartmentsState>({
    departments: [],
    isLoading: false,
    error: null,
  })

  const fetchDepartments = useCallback(async () => {
    if (!enabled) {
      setState({ departments: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listDepartmentsAction()
    if (result.success) {
      setState({
        departments: result.data,
        isLoading: false,
        error: null,
      })
    } else {
      setState({ departments: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchDepartments()
  }, [fetchDepartments])

  return {
    departments: state.departments,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchDepartments,
  }
}
