export interface OrganizationProfileDto {
  isConfigured: boolean
  legalName: string | null
  commercialName: string | null
  rtn: string | null
  address: string | null
  phone: string | null
  email: string | null
  legalRepresentativeName: string | null
  legalRepresentativeIdentity: string | null
  reportLogoDocumentId: string | null
  reportLogoFileName: string | null
}

export interface OrganizationProfileUpdateDto {
  legalName: string
  commercialName: string | null
  rtn: string
  address: string
  phone: string
  email: string | null
  legalRepresentativeName: string
  legalRepresentativeIdentity: string
}
