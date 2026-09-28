export interface DocumentTypeListItemDto {
  id: string
  code: string
  name: string
  context: string
  supportsPreview: boolean
}

export interface DocumentVariableCatalogItemDto {
  code: string
  displayName: string
  description: string
  category: string
  displayOrder: number
  isVisible: boolean
  isActive: boolean
  valueType: string
  sensitivity: string
  supportedFilters: string[]
  canUseInCondition: boolean
  isCollection: boolean
  itemFields: DocumentVariableCatalogItemDto[]
  exampleValueJson: string | null
  formatOverride: string | null
}

export interface DocumentTemplateListItemDto {
  id: string
  code: string
  name: string
  description: string | null
  documentTypeId: string
  documentTypeCode: string
  documentTypeName: string
  context: string
  isActive: boolean
  versionCount: number
  publishedVersionNumber: number | null
}

export interface DocumentTemplateDetailDto extends DocumentTemplateListItemDto {
  createdAt: string
  updatedAt: string | null
  versions: DocumentTemplateVersionSummaryDto[]
}

export interface DocumentTemplateVersionSummaryDto {
  id: string
  versionNumber: number
  status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED' | 'RETIRED' | string
  createdAt: string
  publishedAt: string | null
  templateHashSha256: string | null
  isValid: boolean | null
}

export interface DocumentTemplateVersionDraftRequestDto {
  bodyHtml: string
  headerHtml: string | null
  footerHtml: string | null
  pageSize: 'LETTER' | 'LEGAL' | 'A4'
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  marginTopMm: number
  marginRightMm: number
  marginBottomMm: number
  marginLeftMm: number
  requiredVariableCodes: string[]
}

export interface DocumentTemplateValidationDto {
  isValid: boolean
  errors: string[]
  variableCodes: string[]
}

export interface DocumentTemplateVersionDetailDto extends DocumentTemplateVersionSummaryDto {
  documentTemplateId: string
  bodyHtml: string
  headerHtml: string | null
  footerHtml: string | null
  pageSize: 'LETTER' | 'LEGAL' | 'A4' | string
  orientation: 'PORTRAIT' | 'LANDSCAPE' | string
  marginTopMm: number
  marginRightMm: number
  marginBottomMm: number
  marginLeftMm: number
  publishedBy: string | null
  updatedAt: string | null
  requiredVariableCodes: string[]
  validation: DocumentTemplateValidationDto | null
}

export interface DocumentTemplatePreviewDto {
  isPreview: boolean
  rootContext: string
  html: string
  warnings: string[]
}

export interface DocumentTemplatePublishResultDto {
  published: boolean
  validation: DocumentTemplateValidationDto
  version: DocumentTemplateVersionDetailDto
}

export interface DocumentTemplateCreateRequestDto {
  code: string
  name: string
  description: string | null
  documentTypeId: string
}

export interface DocumentTemplateUpdateRequestDto {
  name: string
  description: string | null
  isActive: boolean
}

export interface DocumentTemplateVersionValidationRequestDto {
  requiredVariableCodes: string[]
}
