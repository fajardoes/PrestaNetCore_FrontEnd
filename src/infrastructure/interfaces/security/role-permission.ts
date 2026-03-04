export interface SecurityPermissionCatalogItem {
  code: string
  name: string
  description?: string | null
}

export interface SecurityRolePermissions {
  roleId: string
  roleName: string
  permissions: string[]
}

export interface UpdateRolePermissionsPayload {
  permissions: string[]
}

export interface UpdateRolePermissionsResult {
  succeeded: boolean
  failureReason?: string | null
  role: SecurityRolePermissions
}
