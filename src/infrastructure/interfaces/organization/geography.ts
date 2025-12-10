export interface Department {
  id: string
  name: string
  slug: string
  code: string
  activo: boolean
}

export interface Municipality {
  id: string
  departmentId: string
  departmentName: string
  name: string
  slug: string
  activo: boolean
}

export interface DepartmentOperationResult {
  succeeded: boolean
  failureReason?: string | null
  department?: Department | null
}

export interface MunicipalityOperationResult {
  succeeded: boolean
  failureReason?: string | null
  municipality?: Municipality | null
}
