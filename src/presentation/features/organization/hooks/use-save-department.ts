import { useCallback, useState } from 'react'
import { saveDepartmentAction } from '@/core/actions/geography/save-department.action'
import type { DepartmentPayload } from '@/core/api/geography-api'
import type { Department } from '@/infrastructure/interfaces/organization/geography'

interface SaveDepartmentState {
  isSaving: boolean
  error: string | null
  lastSaved?: Department
}

export const useSaveDepartment = () => {
  const [state, setState] = useState<SaveDepartmentState>({
    isSaving: false,
    error: null,
  })

  const saveDepartment = useCallback(
    async (payload: DepartmentPayload, departmentId?: string) => {
      setState({ isSaving: true, error: null })
      const result = await saveDepartmentAction(payload, departmentId)
      if (result.success) {
        setState({
          isSaving: false,
          error: null,
          lastSaved: result.data,
        })
        return { success: true, department: result.data }
      }
      setState({ isSaving: false, error: result.error })
      return { success: false, error: result.error }
    },
    [],
  )

  return {
    ...state,
    saveDepartment,
  }
}
