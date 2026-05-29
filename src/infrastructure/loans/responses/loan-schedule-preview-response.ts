import type { LoanDisbursementChargeResponse } from './loan-disbursement-charge-response'
import type { LoanInsurancePreviewResponse } from './loan-insurance-response'
import type {
  PaymentFrequencyCode,
  TermUnitCode,
} from '@/infrastructure/loans/types/loan-contract.types'

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
  contractualTerm: number
  termUnitId: string
  termUnitCode: TermUnitCode
  paymentFrequencyId: string
  paymentFrequencyCode: PaymentFrequencyCode
  maturityDate: string
  installmentsCount: number
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
  anticipatedInstallmentDeductionAmount: number
  totalScheduledInsurance?: number | null
  charges: LoanDisbursementChargeResponse[]
}

export interface LoanSchedulePreviewResponse {
  installments: LoanSchedulePreviewInstallmentResponse[]
  metadata: LoanSchedulePreviewMetadataResponse
  disbursement?: LoanSchedulePreviewDisbursementResponse | null
  insurance?: LoanInsurancePreviewResponse | null
}
