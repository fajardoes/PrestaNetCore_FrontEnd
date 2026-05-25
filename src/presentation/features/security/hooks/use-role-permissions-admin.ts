import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoleAction } from '@/core/actions/security/create-role.action'
import { getRolePermissionsAction } from '@/core/actions/security/get-role-permissions.action'
import { listPermissionsAction } from '@/core/actions/security/list-permissions.action'
import { listRolesAction } from '@/core/actions/security/list-roles.action'
import { updateRolePermissionsAction } from '@/core/actions/security/update-role-permissions.action'
import type { SecurityPermissionCatalogItem } from '@/infrastructure/interfaces/security/role-permission'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

interface UseRolePermissionsAdminOptions {
  enabled?: boolean
}

interface RolePermissionsState {
  roles: SecurityRole[]
  catalog: SecurityPermissionCatalogItem[]
  selectedRoleName: string
  assignedPermissions: string[]
  isLoadingRoles: boolean
  isLoadingRoleData: boolean
  isSaving: boolean
  isCreatingRole: boolean
  rolesError: string | null
  roleDataError: string | null
  saveError: string | null
  createRoleError: string | null
}

export const useRolePermissionsAdmin = (
  options?: UseRolePermissionsAdminOptions,
) => {
  const enabled = options?.enabled ?? true

  const [state, setState] = useState<RolePermissionsState>({
    roles: [],
    catalog: [],
    selectedRoleName: '',
    assignedPermissions: [],
    isLoadingRoles: false,
    isLoadingRoleData: false,
    isSaving: false,
    isCreatingRole: false,
    rolesError: null,
    roleDataError: null,
    saveError: null,
    createRoleError: null,
  })

  const loadRoles = useCallback(async () => {
    if (!enabled) {
      setState((prev) => ({
        ...prev,
        roles: [],
        selectedRoleName: '',
        assignedPermissions: [],
        isLoadingRoles: false,
        rolesError: null,
        createRoleError: null,
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoadingRoles: true, rolesError: null }))
    const result = await listRolesAction()

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        roles: [],
        selectedRoleName: '',
        assignedPermissions: [],
        isLoadingRoles: false,
        rolesError: result.error,
      }))
      return
    }

    const nextRoles = result.data
    const fallbackSelectedRole = nextRoles[0]?.name ?? ''

    setState((prev) => ({
      ...prev,
      roles: nextRoles,
      selectedRoleName:
        prev.selectedRoleName && nextRoles.some((role) => role.name === prev.selectedRoleName)
          ? prev.selectedRoleName
          : fallbackSelectedRole,
      isLoadingRoles: false,
      rolesError: null,
    }))
  }, [enabled])

  const loadRoleData = useCallback(async (roleName: string) => {
    if (!enabled || !roleName) {
      setState((prev) => ({
        ...prev,
        catalog: [],
        assignedPermissions: [],
        isLoadingRoleData: false,
        roleDataError: null,
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      isLoadingRoleData: true,
      roleDataError: null,
      saveError: null,
    }))

    const [catalogResult, rolePermissionsResult] = await Promise.all([
      listPermissionsAction(),
      getRolePermissionsAction(roleName),
    ])

    if (!catalogResult.success) {
      setState((prev) => ({
        ...prev,
        catalog: [],
        assignedPermissions: [],
        isLoadingRoleData: false,
        roleDataError: catalogResult.error,
      }))
      return
    }

    if (!rolePermissionsResult.success) {
      setState((prev) => ({
        ...prev,
        catalog: catalogResult.data,
        assignedPermissions: [],
        isLoadingRoleData: false,
        roleDataError: rolePermissionsResult.error,
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      catalog: catalogResult.data,
      assignedPermissions: Array.from(new Set(rolePermissionsResult.data.permissions)),
      isLoadingRoleData: false,
      roleDataError: null,
    }))
  }, [enabled])

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  useEffect(() => {
    if (!state.selectedRoleName || !enabled) return
    void loadRoleData(state.selectedRoleName)
  }, [enabled, loadRoleData, state.selectedRoleName])

  const setSelectedRoleName = useCallback((roleName: string) => {
    setState((prev) => ({
      ...prev,
      selectedRoleName: roleName,
      roleDataError: null,
      saveError: null,
      createRoleError: null,
    }))
  }, [])

  const togglePermission = useCallback((permissionCode: string) => {
    setState((prev) => {
      const current = new Set(prev.assignedPermissions)
      if (current.has(permissionCode)) {
        current.delete(permissionCode)
      } else {
        current.add(permissionCode)
      }
      return {
        ...prev,
        assignedPermissions: Array.from(current),
      }
    })
  }, [])

  const replaceAssignedPermissions = useCallback((permissions: string[]) => {
    setState((prev) => ({
      ...prev,
      assignedPermissions: Array.from(new Set(permissions)),
    }))
  }, [])

  const save = useCallback(async () => {
    if (!enabled || !state.selectedRoleName) {
      return { success: false as const, error: 'Selecciona un rol.' }
    }

    setState((prev) => ({ ...prev, isSaving: true, saveError: null }))
    const result = await updateRolePermissionsAction(
      state.selectedRoleName,
      state.assignedPermissions,
    )

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveError: result.error,
      }))
      return { success: false as const, error: result.error, status: result.status }
    }

    setState((prev) => ({
      ...prev,
      assignedPermissions: Array.from(new Set(result.data.permissions)),
      isSaving: false,
      saveError: null,
    }))

    return { success: true as const }
  }, [enabled, state.assignedPermissions, state.selectedRoleName])

  const createRole = useCallback(
    async (roleName: string) => {
      if (!enabled) {
        return { success: false as const, error: 'No autorizado para crear roles.' }
      }

      setState((prev) => ({
        ...prev,
        isCreatingRole: true,
        createRoleError: null,
      }))

      const result = await createRoleAction(roleName.trim())

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          isCreatingRole: false,
          createRoleError: result.error,
        }))
        return { success: false as const, error: result.error }
      }

      setState((prev) => ({
        ...prev,
        selectedRoleName: result.data.name,
        isCreatingRole: false,
        createRoleError: null,
      }))

      await loadRoles()
      await loadRoleData(result.data.name)
      return { success: true as const, role: result.data }
    },
    [enabled, loadRoleData, loadRoles],
  )

  const availablePermissionCodes = useMemo(
    () => new Set(state.catalog.map((permission) => permission.code)),
    [state.catalog],
  )

  return {
    ...state,
    availablePermissionCodes,
    setSelectedRoleName,
    togglePermission,
    replaceAssignedPermissions,
    createRole,
    loadRoles,
    loadRoleData,
    save,
  }
}
