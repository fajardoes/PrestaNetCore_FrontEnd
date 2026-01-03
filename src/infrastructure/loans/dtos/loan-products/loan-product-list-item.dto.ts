export interface LoanProductListItemDto {
  id: string
  code: string
  name: string
  currencyCode: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  termUnit: string
  portfolioType: string
  isActive: boolean
}
