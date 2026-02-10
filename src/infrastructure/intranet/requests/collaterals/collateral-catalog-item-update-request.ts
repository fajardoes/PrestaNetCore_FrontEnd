export interface CollateralCatalogItemUpdateRequestDto {
  code: string
  name: string
  sortOrder?: number | null
  isActive: boolean
}
