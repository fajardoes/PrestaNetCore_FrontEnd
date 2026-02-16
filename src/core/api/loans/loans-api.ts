import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'
import type { LoanInstallmentResponse } from '@/infrastructure/loans/responses/loan-installment-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

const basePath = '/loans'

export const getLoan = async (id: string): Promise<LoanResponse> => {
  const { data } = await httpClient.get<LoanResponse>(`${basePath}/${id}`)
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
