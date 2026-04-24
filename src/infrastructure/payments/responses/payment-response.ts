import type { PaymentAllocationResponse } from './payment-allocation-response'

export interface PaymentResponse {
  id: string
  loanId: string
  loanNo: string
  clientId: string
  clientFullName: string
  collectionChannelId: string
  collectionChannelName: string
  registeredByUserId: string
  paymentDate: string
  businessDate: string
  paymentTypeCode: string
  paymentTypeName: string
  amount: number
  currencyCode: string
  referenceNumber?: string | null
  externalReceiptNumber?: string | null
  internalReceiptNumber: string
  statusCode: string
  statusName: string
  applicationStatusCode: string
  journalEntryId?: string | null
  journalEntryNumber?: string | null
  effectivizationJournalEntryId?: string | null
  reversalJournalEntryId?: string | null
  notes?: string | null
  allocations: PaymentAllocationResponse[]
}
