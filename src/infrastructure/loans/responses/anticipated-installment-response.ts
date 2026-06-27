export type AnticipatedInstallmentStatusCode =
  | 'PENDING'
  | 'ACCOUNTED'
  | 'PARTIALLY_APPLIED'
  | 'FULLY_APPLIED'
  | 'CANCELLED'
  | 'REVERSED'

export interface AnticipatedInstallmentResponse {
  id: string
  loanApplicationId: string
  statusCode: AnticipatedInstallmentStatusCode
  statusName: string
  originalAmount: number
  currentAmount: number
  appliedAmount: number
  pendingAmount: number
  maxAllowedAmountSnapshot: number | null
  limitSource: string | null
  limitStrategyCode: string | null
  disbursementJournalEntryId: string | null
  disbursementJournalEntryNumber: string | null
  accountingRegisteredAt: string | null
  accountingRegisteredBusinessDate: string | null
  canModify: boolean
  canCancel: boolean
  createdBusinessDate: string
  updatedBusinessDate: string | null
  notes: string | null
}

export interface AnticipatedInstallmentEventResponse {
  id: string
  eventCode: string
  previousAmount: number | null
  newAmount: number | null
  previousStatusCode: string | null
  newStatusCode: string | null
  reason: string | null
  journalEntryId: string | null
  businessDate: string
  createdAt: string
}

export interface AnticipatedInstallmentLimitPreviewResponse {
  isAllowed: boolean
  requestedAmount: number | null
  maxAllowedAmount: number
  limitSource: string
  limitStrategyCode: string
  message: string
}

export interface AnticipatedInstallmentApplicationAllocationResponse {
  loanInstallmentId: string
  loanInstallmentComponentId: string
  componentCode: string
  installmentNo: number
  allocationOrder: number
  amount: number
}

export interface AnticipatedInstallmentApplicationResponse {
  id: string
  loanId: string
  amount: number
  applicationStatusCode: 'APPLIED' | 'REVERSED'
  businessDate: string
  appliedAt: string
  reason: string | null
  journalEntryId: string | null
  reversalJournalEntryId: string | null
  allocations: AnticipatedInstallmentApplicationAllocationResponse[]
}

export interface AnticipatedInstallmentLoanDetailResponse {
  anticipatedInstallment: AnticipatedInstallmentResponse
  history: AnticipatedInstallmentEventResponse[]
  applications: AnticipatedInstallmentApplicationResponse[]
}

export interface AnticipatedInstallmentSettingsResponse {
  id: string
  loanProductId: string | null
  isGlobal: boolean
  isEnabled: boolean
  maxAmount: number | null
  maxPercentageOfApprovedAmount: number | null
  limitStrategyCode: string
  requiresAuthorizationAboveLimit: boolean
  authorizationThresholdAmount: number | null
  authorizationThresholdPercentage: number | null
  autoApplyRemainingAnticipatedInstallmentOnClosure: boolean
  blockClosureWhenAnticipatedInstallmentPending: boolean
  effectiveFrom: string | null
  effectiveTo: string | null
  isActive: boolean
}

export interface AnticipatedInstallmentCatalogItem {
  id: string
  code: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
}
