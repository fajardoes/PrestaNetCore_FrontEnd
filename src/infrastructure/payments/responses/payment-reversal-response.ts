export interface PaymentReversalResponse {
  paymentId: string
  reversalId: string
  originalStatusCode: string
  statusCode: string
  amount: number
  reversalDate: string
  businessDate: string
  reason: string
  registrationReversalJournalEntryId: string | null
  registrationReversalJournalEntryNumber: string | null
  effectivizationReversalJournalEntryId: string | null
  effectivizationReversalJournalEntryNumber: string | null
  channelOutstandingAmount: number
  userOutstandingAmount: number
}
