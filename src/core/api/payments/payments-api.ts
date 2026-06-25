import { httpClient } from '@/infrastructure/api/httpClient'
import type { CreatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/create-payment-component-priority-request'
import type { EffectivizePaymentRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { ApproveBankPaymentProofRequest } from '@/infrastructure/payments/requests/effectivize-payment-request'
import type { ListPaymentsRequest } from '@/infrastructure/payments/requests/list-payments-request'
import type {
  RegisterBankPaymentProofRequest,
  RegisterCashCollectionPaymentRequest,
  RegisterPaymentRequest,
} from '@/infrastructure/payments/requests/register-payment-request'
import type { RejectBankPaymentProofRequest } from '@/infrastructure/payments/requests/reject-bank-payment-proof-request'
import type { ReorderPaymentComponentPrioritiesRequest } from '@/infrastructure/payments/requests/reorder-payment-component-priorities-request'
import type { ReversePaymentRequest } from '@/infrastructure/payments/requests/reverse-payment-request'
import type { UpdatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/update-payment-component-priority-request'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import type { PaymentListResponse } from '@/infrastructure/payments/responses/payment-list-response'
import type { PaymentLookupResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'

const basePath = '/payments'
const cashCollectionsPath = '/cash-collections/payments'
const bankProofsPath = '/bank-payment-proofs'

export const listPaymentComponentPriorities =
  async (): Promise<PaymentComponentPriorityResponse[]> => {
    const { data } = await httpClient.get<PaymentComponentPriorityResponse[]>(
      `${basePath}/component-priorities`,
    )
    return data
  }

export const createPaymentComponentPriority = async (
  payload: CreatePaymentComponentPriorityRequest,
): Promise<PaymentComponentPriorityResponse> => {
  const { data } = await httpClient.post<PaymentComponentPriorityResponse>(
    `${basePath}/component-priorities`,
    payload,
  )
  return data
}

export const updatePaymentComponentPriority = async (
  id: string,
  payload: UpdatePaymentComponentPriorityRequest,
): Promise<PaymentComponentPriorityResponse> => {
  const { data } = await httpClient.put<PaymentComponentPriorityResponse>(
    `${basePath}/component-priorities/${id}`,
    payload,
  )
  return data
}

export const deactivatePaymentComponentPriority = async (
  id: string,
): Promise<void> => {
  await httpClient.patch(`${basePath}/component-priorities/${id}/deactivate`)
}

export const reorderPaymentComponentPriorities = async (
  payload: ReorderPaymentComponentPrioritiesRequest,
): Promise<PaymentComponentPriorityResponse[]> => {
  const { data } = await httpClient.put<PaymentComponentPriorityResponse[]>(
    `${basePath}/component-priorities/reorder`,
    payload,
  )
  return data
}

export const registerPayment = async (
  payload: RegisterPaymentRequest,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(basePath, payload)
  return data
}

export const registerCashCollectionPayment = async (
  payload: RegisterCashCollectionPaymentRequest,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(cashCollectionsPath, payload)
  return data
}

export const registerBankPaymentProof = async (
  payload: RegisterBankPaymentProofRequest,
): Promise<PaymentResponse> => {
  const formData = new FormData()
  formData.append('loanId', payload.loanId)
  formData.append('amount', payload.amount.toString())
  if (payload.bankEntityId) formData.append('bankEntityId', payload.bankEntityId)
  formData.append('bankReferenceNumber', payload.bankReferenceNumber)
  formData.append('bankDepositDate', payload.bankDepositDate)
  formData.append('proofFile', payload.proofFile)
  if (payload.externalReceiptNumber) {
    formData.append('externalReceiptNumber', payload.externalReceiptNumber)
  }
  if (payload.notes) formData.append('notes', payload.notes)

  const { data } = await httpClient.post<PaymentResponse>(bankProofsPath, formData)
  return data
}

export const listPayments = async (
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> => {
  const { data } = await httpClient.get<PaymentListResponse>(basePath, {
    params,
  })
  return data
}

export const listCashCollectionPayments = async (
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> => {
  const { data } = await httpClient.get<PaymentListResponse>(cashCollectionsPath, {
    params,
  })
  return data
}

export const listBankPaymentProofs = async (
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> => {
  const { data } = await httpClient.get<PaymentListResponse>(bankProofsPath, {
    params,
  })
  return data
}

export const getPayment = async (id: string): Promise<PaymentResponse> => {
  const { data } = await httpClient.get<PaymentResponse>(`${basePath}/${id}`)
  return data
}

export const getBankPaymentProof = async (id: string): Promise<PaymentResponse> => {
  const { data } = await httpClient.get<PaymentResponse>(`${bankProofsPath}/${id}`)
  return data
}

export const getPaymentActions = async (
  id: string,
): Promise<PaymentActionsResponse> => {
  const { data } = await httpClient.get<PaymentActionsResponse>(
    `${basePath}/${id}/actions`,
  )
  return data
}

export const effectivizePayment = async (
  id: string,
  payload: EffectivizePaymentRequest,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(
    `${basePath}/${id}/effectivize`,
    payload,
  )
  return data
}

export const settleCashCollectionPayment = async (
  id: string,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(
    `${cashCollectionsPath}/${id}/settle`,
  )
  return data
}

export const approveBankPaymentProof = async (
  id: string,
  payload: ApproveBankPaymentProofRequest,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(
    `${bankProofsPath}/${id}/approve`,
    payload,
  )
  return data
}

export const rejectBankPaymentProof = async (
  id: string,
  payload: RejectBankPaymentProofRequest,
): Promise<PaymentResponse> => {
  const { data } = await httpClient.post<PaymentResponse>(
    `${bankProofsPath}/${id}/reject`,
    payload,
  )
  return data
}

export const reversePayment = async (
  id: string,
  payload: ReversePaymentRequest,
): Promise<PaymentReversalResponse> => {
  const { data } = await httpClient.post<PaymentReversalResponse>(
    `${basePath}/${id}/reverse`,
    payload,
  )
  return data
}

export const reverseCashCollectionPayment = async (
  id: string,
  payload: ReversePaymentRequest,
): Promise<PaymentReversalResponse> => {
  const { data } = await httpClient.post<PaymentReversalResponse>(
    `${cashCollectionsPath}/${id}/reverse`,
    payload,
  )
  return data
}

export const reverseBankPaymentProof = async (
  id: string,
  payload: ReversePaymentRequest,
): Promise<PaymentReversalResponse> => {
  const { data } = await httpClient.post<PaymentReversalResponse>(
    `${bankProofsPath}/${id}/reverse`,
    payload,
  )
  return data
}

export const getPaymentReversal = async (
  id: string,
): Promise<PaymentReversalResponse> => {
  const { data } = await httpClient.get<PaymentReversalResponse>(
    `${basePath}/${id}/reversal`,
  )
  return data
}

export const lookupPayments = async (params: {
  clientIdentityNo?: string
  loanNo?: string
}): Promise<PaymentLookupResponse> => {
  const { data } = await httpClient.get<PaymentLookupResponse>(`${basePath}/lookup`, {
    params,
  })
  return data
}
