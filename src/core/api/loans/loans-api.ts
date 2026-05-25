import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'
import type { LoanInstallmentResponse } from '@/infrastructure/loans/responses/loan-installment-response'
import type { LoanActionsResponse } from '@/infrastructure/loans/responses/loan-actions-response'
import type { LoanClientsSearchRequest } from '@/infrastructure/loans/requests/loan-clients-search-request'
import type { LoanDisbursementReversalRequest } from '@/infrastructure/loans/requests/loan-disbursement-reversal-request'
import type { ListLoansRequest } from '@/infrastructure/loans/requests/list-loans-request'
import type { LoanClientSearchResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { LoanDisbursementReversalEligibilityResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'
import type { LoanDisbursementReversalResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-response'
import type { LoanListResponse } from '@/infrastructure/loans/responses/loan-list-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

const basePath = '/loans'

export const getLoan = async (id: string): Promise<LoanResponse> => {
  const { data } = await httpClient.get<LoanResponse>(`${basePath}/${id}`)
  return data
}

export const getLoanByCode = async (loanCode: string): Promise<LoanResponse> => {
  const { data } = await httpClient.get<LoanResponse>(
    `${basePath}/by-code/${encodeURIComponent(loanCode)}`,
  )
  return data
}

export const searchLoanClients = async (
  params: LoanClientsSearchRequest,
): Promise<LoanClientSearchResponse> => {
  const { data } = await httpClient.get<LoanClientSearchResponse>(`${basePath}/clients/search`, {
    params,
  })
  return data
}

export const listLoans = async (params: ListLoansRequest): Promise<LoanListResponse> => {
  const { data } = await httpClient.get<LoanListResponse>(basePath, { params })
  return data
}

export const getLoanActions = async (id: string): Promise<LoanActionsResponse> => {
  const { data } = await httpClient.get<LoanActionsResponse>(`${basePath}/${id}/actions`)
  return data
}

export const getLoanDisbursementReversalEligibility = async (
  id: string,
): Promise<LoanDisbursementReversalEligibilityResponse> => {
  const { data } = await httpClient.get<LoanDisbursementReversalEligibilityResponse>(
    `${basePath}/${id}/disbursement-reversal/eligibility`,
  )
  return data
}

export const reverseLoanDisbursement = async (
  id: string,
  payload: LoanDisbursementReversalRequest,
): Promise<LoanDisbursementReversalResponse> => {
  const { data } = await httpClient.post<LoanDisbursementReversalResponse>(
    `${basePath}/${id}/reverse-disbursement`,
    payload,
  )
  return data
}

export const listLoanInstallments = async (
  loanId: string,
): Promise<LoanInstallmentResponse[]> => {
  const { data } = await httpClient.get<LoanInstallmentResponse[]>(
    `${basePath}/${loanId}/installments`,
  )
  return data
}

export const getLoanInstallment = async (
  loanId: string,
  installmentNo: number,
): Promise<LoanInstallmentDetailResponse> => {
  const { data } = await httpClient.get<LoanInstallmentDetailResponse>(
    `${basePath}/${loanId}/installments/${installmentNo}`,
  )
  return data
}
