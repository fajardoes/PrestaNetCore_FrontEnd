export interface DelinquencyPolicyAssignmentListItemDto {
  id: string
  policyId: string
  policyCode: string
  policyName: string
  agencyId?: string | null
  agencyName?: string | null
  portfolioTypeId?: string | null
  portfolioTypeName?: string | null
  priority: number
  isActive: boolean
}
