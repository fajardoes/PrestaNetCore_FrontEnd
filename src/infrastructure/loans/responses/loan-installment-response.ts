export interface LoanInstallmentComponentResponse {
  id: string
  financialComponentId: string
  financialComponentCode: string
  financialComponentName: string
  sourceRefId?: string | null
  amountProjected: number
  amountPaid: number
}

export interface LoanInstallmentResponse {
  id: string
  loanId: string
  installmentNo: number
  dueDateOriginal: string
  dueDateAdjusted: string
  principalProjected: number
  interestProjected: number
  totalProjected: number
  totalPaid: number
  statusId: string
  statusCode: string
  statusName: string
  components: LoanInstallmentComponentResponse[]
}
