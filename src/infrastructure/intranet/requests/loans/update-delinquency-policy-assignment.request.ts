export interface UpdateDelinquencyPolicyAssignmentRequestDto {
  policyId: string
  agencyId?: string | null
  portfolioTypeId?: string | null
  priority: number
}
