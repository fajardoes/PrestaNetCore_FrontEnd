export interface UpdateCollateralRequestDto {
  ownerClientId: string
  collateralTypeId: string
  guarantorClientId?: string | null
  statusId: string
  referenceNo?: string | null
  description?: string | null
  appraisedValue?: number | null
  appraisedDate?: string | null
  isActive: boolean
}
