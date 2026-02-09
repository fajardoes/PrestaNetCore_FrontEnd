export interface CollateralCatalogItemCreateRequestDto {
  code: string
  name: string
  sortOrder?: number | null
  isActive?: boolean
}
