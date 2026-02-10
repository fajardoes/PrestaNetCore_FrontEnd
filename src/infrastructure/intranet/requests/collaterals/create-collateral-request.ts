export interface CreateCollateralRequestDto {
  ownerClientId: string
  collateralTypeId: string
  statusId?: string | null
  referenceNo?: string | null
  description?: string | null
  appraisedValue?: number | null
  appraisedDate?: string | null
}
