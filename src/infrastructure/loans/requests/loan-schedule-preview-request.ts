export interface LoanSchedulePreviewRequest {
  principalOverride?: number | null
  termOverride?: number | null
  paymentFrequencyIdOverride?: string | null
  nominalRateOverride?: number | null
  firstDueDateOverride?: string | null
}
