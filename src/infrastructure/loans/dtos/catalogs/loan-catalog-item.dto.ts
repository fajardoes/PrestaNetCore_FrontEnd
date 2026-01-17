export interface LoanCatalogItemDto {
  id: string
  code: string
  name: string
  description?: string | null
  sortOrder: number
  isActive: boolean
}
