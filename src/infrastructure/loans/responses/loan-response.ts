export interface LoanResponse {
  id: string
  applicationId: string
  clientId: string
  loanProductId: string
  statusId: string
  statusCode: string
  statusName: string
  principal: number
  term: number
  paymentFrequencyId: string
  paymentFrequencyCode: string
  paymentFrequencyName: string
  createdOperationalDate: string
  scheduleCommittedOperationalDate: string
  scheduleVersion: number
  installmentsCount?: number | null
  firstDueDate?: string | null
  maturityDate?: string | null
  nominalRate: number
}
