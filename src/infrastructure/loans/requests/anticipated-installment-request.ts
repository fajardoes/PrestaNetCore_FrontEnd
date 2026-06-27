export interface UpsertAnticipatedInstallmentRequest {
  amount: number
  reason?: string | null
  notes?: string | null
  idempotencyKey?: string | null
}

export interface CancelAnticipatedInstallmentRequest {
  reason: string
}

export interface AnticipatedInstallmentLimitPreviewRequest {
  amount: number | null
}

export interface ApplyAnticipatedInstallmentRequest {
  amount?: number | null
  applyFullPending: boolean
  reason?: string | null
  idempotencyKey?: string | null
}

export interface ReverseAnticipatedInstallmentApplicationRequest {
  reason: string
}

export interface UpsertAnticipatedInstallmentSettingsRequest {
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
