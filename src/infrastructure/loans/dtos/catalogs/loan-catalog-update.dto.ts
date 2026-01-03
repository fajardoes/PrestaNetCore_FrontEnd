export interface LoanCatalogUpdateDto {
  code: string
  name: string
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
}
