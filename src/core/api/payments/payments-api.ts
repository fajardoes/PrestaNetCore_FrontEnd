import { httpClient } from '@/infrastructure/api/httpClient'
import type { CreatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/create-payment-component-priority-request'
import type { ListPaymentsRequest } from '@/infrastructure/payments/requests/list-payments-request'
import type { RegisterPaymentRequest } from '@/infrastructure/payments/requests/register-payment-request'
import type { ReorderPaymentComponentPrioritiesRequest } from '@/infrastructure/payments/requests/reorder-payment-component-priorities-request'
import type { UpdatePaymentComponentPriorityRequest } from '@/infrastructure/payments/requests/update-payment-component-priority-request'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import type { PaymentListResponse } from '@/infrastructure/payments/responses/payment-list-response'
import type { PaymentLookupResponse } from '@/infrastructure/payments/responses/payment-lookup-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

const basePath = '/payments'

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

export const listPayments = async (
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> => {
  const { data } = await httpClient.get<PaymentListResponse>(basePath, {
    params,
  })
  return data
}

export const getPayment = async (id: string): Promise<PaymentResponse> => {
  const { data } = await httpClient.get<PaymentResponse>(`${basePath}/${id}`)
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
