export type DocumentGenerationTiming =
  | 'PRE_DISBURSEMENT'
  | 'POST_DISBURSEMENT'
  | 'ON_DEMAND'

export interface LoanProductDocumentRequirementDto {
  id: string
  documentTemplateId: string
  templateCode: string
  templateName: string
  documentTypeCode: string
  documentTypeName: string
  context: string
  isRequired: boolean
  generationTiming: DocumentGenerationTiming
  displayOrder: number
  applicabilityRuleCode: string | null
  isActive: boolean
  hasPublishedVersion: boolean
  publishedVersionNumber: number | null
  isOperationallyReady: boolean
}

export interface LoanProductDocumentRequirementsDto {
  productId: string
  productIsActive: boolean
  requirements: LoanProductDocumentRequirementDto[]
}

export interface LoanProductDocumentTemplateOptionDto {
  id: string
  code: string
  name: string
  documentTypeCode: string
  documentTypeName: string
  context: string
  isActive: boolean
  documentTypeIsActive: boolean
  hasPublishedVersion: boolean
  publishedVersionNumber: number | null
  isOperationallyReady: boolean
}

export interface LoanProductDocumentRequirementUpdateItemDto {
  documentTemplateId: string
  isRequired: boolean
  generationTiming: DocumentGenerationTiming
  displayOrder: number
  applicabilityRuleCode: null
}

export interface LoanProductDocumentRequirementsUpdateRequestDto {
  requirements: LoanProductDocumentRequirementUpdateItemDto[]
}

export interface LoanProductDocumentRequirementEventDto {
  id: string
  requirementId: string
  documentTemplateId: string
  templateCode: string
  templateName: string
  eventType: string
  actorUserId: string
  occurredAt: string
  previousIsRequired: boolean | null
  newIsRequired: boolean | null
  previousGenerationTiming: string | null
  newGenerationTiming: string | null
  previousDisplayOrder: number | null
  newDisplayOrder: number | null
  previousApplicabilityRuleCode: string | null
  newApplicabilityRuleCode: string | null
  previousIsActive: boolean | null
  newIsActive: boolean | null
}
