export interface LoanInsuranceBlockResponse {
  insuranceYearNo: number
  blockNo: number
  blockStartInstallmentNo: number
  blockEndInstallmentNo: number
  monthsInBlock: number
  calculationBaseAmount: number
  annualInsuranceAmount: number
  blockInsuranceAmount: number
}

export interface LoanInsuranceSchedulePreviewItemResponse {
  installmentNo: number
  insuranceYearNo: number
  blockNo: number
  calculationBaseAmount: number
  insuranceAmount: number
}

export interface LoanInsuranceScheduleItemResponse
  extends LoanInsuranceSchedulePreviewItemResponse {
  id: string
  loanInstallmentId: string
  calculationBaseCode?: string | null
  valueTypeCode?: string | null
  configuredValue?: number | null
  annualInsuranceAmount?: number | null
  blockInsuranceAmount?: number | null
  scheduledInsuranceAmount?: number | null
  statusCode?: string | null
  isCollected?: boolean | null
  collectedAt?: string | null
  isCancelled?: boolean | null
  cancelledAt?: string | null
  cancellationReason?: string | null
}

export interface LoanInsuranceDefinitionPreviewResponse {
  loanProductInsuranceId: string
  insuranceTypeCode?: string | null
  insuranceTypeName?: string | null
  valueTypeCode?: string | null
  configuredValue?: number | null
  calculationBaseCode?: string | null
  firstYearInsuranceAmount?: number | null
  futureScheduledInsuranceAmount?: number | null
  blocks: LoanInsuranceBlockResponse[]
  schedule: LoanInsuranceSchedulePreviewItemResponse[]
}

export interface LoanInsuranceDefinitionResponse
  extends LoanInsuranceDefinitionPreviewResponse {
  collectedInsuranceAmount?: number | null
  pendingInsuranceAmount?: number | null
  cancelledInsuranceAmount?: number | null
  schedule: LoanInsuranceScheduleItemResponse[]
}

export interface LoanInsurancePreviewResponse {
  firstYearInsuranceAmount?: number | null
  futureScheduledInsuranceAmount?: number | null
  definitions: LoanInsuranceDefinitionPreviewResponse[]
}

export interface LoanInsuranceResponse extends LoanInsurancePreviewResponse {
  collectedInsuranceAmount?: number | null
  pendingInsuranceAmount?: number | null
  cancelledInsuranceAmount?: number | null
  definitions: LoanInsuranceDefinitionResponse[]
}
