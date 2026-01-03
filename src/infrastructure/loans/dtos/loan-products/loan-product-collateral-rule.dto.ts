export interface LoanProductCollateralRuleDto {
  collateralTypeId: string
  minCoverageRatio: number
  maxItems?: number | null
  isActive: boolean
}
