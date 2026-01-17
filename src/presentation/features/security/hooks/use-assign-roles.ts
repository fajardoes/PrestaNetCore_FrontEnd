import { useCallback, useEffect, useState } from 'react'
import { assignRolesAction } from '@/core/actions/security/assign-roles.action'
import { listRolesAction } from '@/core/actions/security/list-roles.action'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

interface AssignRolesState {
  roles: SecurityRole[]
  isLoading: boolean
  error: string | null
}

interface UseAssignRolesOptions {
  enabled?: boolean
}

export const useAssignRoles = (options?: UseAssignRolesOptions) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<AssignRolesState>({
    roles: [],
    isLoading: false,
    error: null,
  })

  const fetchRoles = useCallback(async () => {
    if (!enabled) {
      setState({ roles: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listRolesAction()
    if (result.success) {
      setState({ roles: result.data, isLoading: false, error: null })
    } else {
      setState({ roles: [], isLoading: false, error: result.error })
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState({ roles: [], isLoading: false, error: null })
      return
    }
    void fetchRoles()
  }, [enabled, fetchRoles])

  const assignRoles = useCallback(
    async (userId: string, roles: string[]) => {
      const result = await assignRolesAction({ userId, roles })
      if (!result.success) {
        setState((prev) => ({ ...prev, error: result.error }))
        return { success: false, error: result.error }
      }
      setState((prev) => ({ ...prev, error: null }))
      return { success: true, roles: result.data }
    },
    [],
  )

  return {
    roles: state.roles,
    isLoading: state.isLoading,
    error: state.error,
    refreshRoles: fetchRoles,
    assignRoles,
  }
}
