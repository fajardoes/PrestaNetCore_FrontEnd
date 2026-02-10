export interface UpdateCollateralRequestDto {
  ownerClientId: string
  collateralTypeId: string
  statusId: string
  referenceNo?: string | null
  description?: string | null
  appraisedValue?: number | null
  appraisedDate?: string | null
  isActive: boolean
}
