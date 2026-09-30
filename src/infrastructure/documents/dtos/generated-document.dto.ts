export type GeneratedDocumentStatus = 'PENDING' | 'RENDERING' | 'GENERATED' | 'FAILED' | 'VOIDED'

export type GeneratedDocumentFailureType =
  | 'MISSING_REQUIRED_CONTEXT'
  | 'RENDERER_ERROR'
  | 'STORAGE_ERROR'
  | 'RENDERING_TIMEOUT'
  | 'UNKNOWN'

export interface GeneratedDocumentQueryDto {
  loanApplicationId?: string
  loanId?: string
  status?: GeneratedDocumentStatus
  documentTemplateId?: string
  pageNumber: number
  pageSize: number
}

export interface GeneratedDocumentListItemDto {
  id: string
  loanApplicationId: string | null
  applicationNumber: string | null
  loanId: string | null
  loanNumber: string | null
  loanProductId: string | null
  loanProductName: string | null
  requirementId: string | null
  documentTemplateId: string
  templateCode: string
  templateName: string
  documentTemplateVersionId: string
  templateVersionNumber: number
  documentTypeId: string
  documentTypeCode: string
  documentTypeName: string
  generationKind: string
  generationTiming: string
  status: GeneratedDocumentStatus
  requestedAt: string
  generatedAt: string | null
  requestedBy: string | null
  retryCount: number
  failureType: GeneratedDocumentFailureType | null
  errorSummary: string | null
  canRetry: boolean
  requiresNewIntent: boolean
  isRenderingStale: boolean
  lastRenderStartedAt: string | null
  fileName: string | null
  canDownload: boolean
}

export interface GeneratedDocumentEventDto {
  id: string
  eventType: string
  occurredAt: string
  businessDate: string
  actorUserId: string | null
  reason: string | null
  failureType: GeneratedDocumentFailureType | null
}

export interface GeneratedDocumentPagedResultDto {
  items: GeneratedDocumentListItemDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface GeneratedDocumentRetryDto {
  id: string
  status: GeneratedDocumentStatus
  retryCount: number
  failureType: GeneratedDocumentFailureType | null
  errorSummary: string | null
  canRetry: boolean
  requiresNewIntent: boolean
  isRenderingStale: boolean
}
