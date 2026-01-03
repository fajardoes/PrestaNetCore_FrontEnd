export interface LoanCatalogCreateDto {
  code: string
  name: string
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
}
