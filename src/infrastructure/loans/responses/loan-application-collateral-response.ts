export interface LoanApplicationCollateralResponse {
  linkId: string
  loanApplicationId: string
  collateralId: string
  collateralReferenceNo?: string | null
  collateralDescription?: string | null
  collateralTypeId: string
  collateralTypeCode: string
  collateralTypeName: string
  collateralStatusId: string
  collateralStatusCode: string
  collateralStatusName: string
  coverageValue?: number | null
  notes?: string | null
}
