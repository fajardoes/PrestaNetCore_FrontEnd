export interface CollectionTransitAccountSettingDto {
  collectionTransitGlAccountId: string | null
  collectionTransitGlAccountCode?: string | null
  collectionTransitGlAccountName?: string | null
  isConfigured: boolean
  isValid: boolean
  validationMessage?: string | null
}
