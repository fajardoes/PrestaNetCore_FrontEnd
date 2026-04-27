import { useCallback, useEffect, useMemo, useState } from 'react'
import { getRolePermissionsAction } from '@/core/actions/security/get-role-permissions.action'
import { useAuthContext } from '@/providers/AuthProvider'

interface UserPermissionsState {
  permissions: string[]
  isLoading: boolean
  error: string | null
}

export const useUserPermissions = () => {
  const { user, isAuthenticated } = useAuthContext()
  const [state, setState] = useState<UserPermissionsState>({
    permissions: [],
    isLoading: false,
    error: null,
  })

  const rolesKey = useMemo(
    () =>
      (user?.roles ?? [])
        .map((role) => role.trim())
        .filter((role) => role.length > 0)
        .sort((a, b) => a.localeCompare(b))
        .join('|'),
    [user?.roles],
  )

  const userPermissionsKey = useMemo(
    () =>
      (user?.permissions ?? [])
        .map((permission) => permission.trim())
        .filter((permission) => permission.length > 0)
        .sort((a, b) => a.localeCompare(b))
        .join('|'),
    [user?.permissions],
  )

  const hasUserPermissionsPayload = Array.isArray(user?.permissions)

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ permissions: [], isLoading: false, error: null })
      return
    }

    const userPermissions = userPermissionsKey
      ? userPermissionsKey.split('|').filter(Boolean)
      : []
    if (userPermissions.length > 0 || hasUserPermissionsPayload) {
      setState({
        permissions: userPermissions,
        isLoading: false,
        error: null,
      })
      return
    }

    const roles = rolesKey ? rolesKey.split('|').filter(Boolean) : []
    if (!roles.length) {
      setState({ permissions: [], isLoading: false, error: null })
      return
    }

    let isCancelled = false

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const results = await Promise.all(
        roles.map((roleName) => getRolePermissionsAction(roleName)),
      )

      if (isCancelled) return

      const permissionSet = new Set<string>()
      let firstError: string | null = null

      results.forEach((result) => {
        if (result.success) {
          result.data.permissions.forEach((permission) => {
            const normalized = permission.trim()
            if (normalized) {
              permissionSet.add(normalized)
            }
          })
          return
        }

        if (!firstError) {
          firstError = result.error
        }
      })

      setState({
        permissions: Array.from(permissionSet),
        isLoading: false,
        error: firstError,
      })
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [hasUserPermissionsPayload, isAuthenticated, rolesKey, userPermissionsKey])

  const permissionsSet = useMemo(() => new Set(state.permissions), [state.permissions])

  const hasPermission = useCallback(
    (permissionCode: string) => permissionsSet.has(permissionCode),
    [permissionsSet],
  )

  return {
    ...state,
    hasPermission,
  }
}
