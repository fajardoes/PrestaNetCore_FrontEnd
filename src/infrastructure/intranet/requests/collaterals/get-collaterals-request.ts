export interface GetCollateralsRequestDto {
  ownerClientId?: string
  typeId?: string
  statusId?: string
  active?: boolean
  search?: string
  skip?: number
  take?: number
}
