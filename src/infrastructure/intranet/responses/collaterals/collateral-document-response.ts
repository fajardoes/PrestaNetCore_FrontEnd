export interface CollateralDocumentResponseDto {
  id: string
  collateralId: string
  documentType?: string | null
  fileName: string
  contentType: string
  sizeBytes?: number | string | null
  downloadUrl: string
  uploadedOperationalDate: string
}
