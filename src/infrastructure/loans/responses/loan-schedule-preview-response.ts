import type { LoanDisbursementChargeResponse } from './loan-disbursement-charge-response'
import type { LoanInsurancePreviewResponse } from './loan-insurance-response'

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

export interface LoanSchedulePreviewDisbursementResponse {
  grossDisbursementAmount: number
  netDisbursementAmount: number
  totalDisbursementFees: number
  totalDisbursementInsurance: number
  totalScheduledInsurance?: number | null
  charges: LoanDisbursementChargeResponse[]
}

export interface LoanSchedulePreviewResponse {
  installments: LoanSchedulePreviewInstallmentResponse[]
  metadata: LoanSchedulePreviewMetadataResponse
  disbursement?: LoanSchedulePreviewDisbursementResponse | null
  insurance?: LoanInsurancePreviewResponse | null
}
