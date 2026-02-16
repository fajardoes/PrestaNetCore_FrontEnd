export interface LoanSchedulePreviewInstallmentComponentResponse {
  componentCode: string
  amount: number
}

export interface LoanSchedulePreviewInstallmentResponse {
  installmentNo: number
  dueDateOriginal: string
  dueDateAdjusted: string
  principal: number
  interest: number
  total: number
  components: LoanSchedulePreviewInstallmentComponentResponse[]
}

export interface LoanSchedulePreviewMetadataResponse {
  nominalRate: number
  effectivePeriodRate: number
  dayRuleId: string
  roundingModeId?: string | null
  amortizationMethodId: string
  interestCalculationMethod: string
  lastInstallmentAdjustment: number
}

export interface LoanSchedulePreviewResponse {
  installments: LoanSchedulePreviewInstallmentResponse[]
  metadata: LoanSchedulePreviewMetadataResponse
}
