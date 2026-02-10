export interface CollateralResponseDto {
  id: string
  ownerClientId: string
  ownerClientName?: string | null
  ownerClientFullName?: string | null
  ownerIdentity?: string | null
  ownerClientIdentityNo?: string | null
  collateralTypeId: string
  collateralTypeCode?: string | null
  collateralTypeName?: string | null
  statusId: string
  statusCode?: string | null
  statusName?: string | null
  referenceNo?: string | null
  description?: string | null
  appraisedValue?: number | null
  appraisedDate?: string | null
  isActive: boolean
  createdAt: string
}
