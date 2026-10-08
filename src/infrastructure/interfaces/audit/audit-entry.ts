export interface AuditEntryChange {
  sequence: number
  propertyPath: string
  oldValueJson: string | null
  newValueJson: string | null
}

export interface AuditEntry {
  id: string
  occurredAt: string
  categoryCode: string
  moduleCode: string
  actionCode: string
  outcomeCode: string
  actorType: string
  actorUserId: string | null
  agencyId: string | null
  sourceCode: string
  correlationId: string | null
  requestMethod: string | null
  routeTemplate: string | null
  httpStatusCode: number | null
  subjectType: string | null
  subjectId: string | null
  errorCode: string | null
  payloadVersion: number
  detailsJson: string | null
  changes: AuditEntryChange[]
}

export interface AuditEntryPage {
  items: AuditEntry[]
  pageNumber: number
  pageSize: number
  totalCount: number
}

export interface AuditCategoryDescriptor {
  code: string
  name: string
  description: string
}

export interface AuditActionDescriptor {
  categoryCode: string
  moduleCode: string | null
  code: string
  name: string
  description: string
}

export interface AuditOutcomeDescriptor {
  code: string
  name: string
}

export interface AuditCatalog {
  categories: AuditCategoryDescriptor[]
  actions: AuditActionDescriptor[]
  outcomes: AuditOutcomeDescriptor[]
}

export interface AuditSearchFilters {
  categoryCodes?: string[]
  moduleCode?: string
  actionCode?: string
  outcomeCode?: string
  errorCode?: string
  actorUserId?: string
  agencyId?: string
  correlationId?: string
  requestMethod?: string
  routeTemplate?: string
  httpStatusCode?: number
  subjectType?: string
  subjectId?: string
  fromUtc: string
  toUtc: string
  pageNumber: number
  pageSize: number
}
