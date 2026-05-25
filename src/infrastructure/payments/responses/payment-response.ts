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
  registeredByUserName?: string | null
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
  effectivizationJournalEntryNumber?: string | null
  effectivizedByUserId?: string | null
  reversalJournalEntryId?: string | null
  effectivizationDate?: string | null
  effectivizationBusinessDate?: string | null
  bankGlAccountId?: string | null
  bankGlAccountCode?: string | null
  bankGlAccountName?: string | null
  bankReferenceNumber?: string | null
  bankDepositDate?: string | null
  effectivizationNotes?: string | null
  notes?: string | null
  allocations: PaymentAllocationResponse[]
}
