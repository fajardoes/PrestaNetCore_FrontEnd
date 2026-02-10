export interface CreateDelinquencyPolicyAssignmentRequestDto {
  policyId: string
  agencyId?: string | null
  portfolioTypeId?: string | null
  priority: number
}
