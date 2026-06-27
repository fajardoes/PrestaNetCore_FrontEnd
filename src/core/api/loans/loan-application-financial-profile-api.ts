import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanApplicationFinancialProfileUpsertRequest } from '@/infrastructure/loans/requests/loan-application-financial-profile-upsert-request'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'

const basePath = '/loans/applications'

export const getLoanApplicationFinancialProfile = async (
  loanApplicationId: string,
): Promise<LoanApplicationFinancialProfileResponse> => {
  const { data } = await httpClient.get<LoanApplicationFinancialProfileResponse>(
    `${basePath}/${loanApplicationId}/financial-profile`,
  )
  return data
}

export const saveLoanApplicationFinancialProfile = async (
  loanApplicationId: string,
  dto: LoanApplicationFinancialProfileUpsertRequest,
): Promise<LoanApplicationFinancialProfileResponse> => {
  const { data } = await httpClient.put<LoanApplicationFinancialProfileResponse>(
    `${basePath}/${loanApplicationId}/financial-profile`,
    dto,
  )
  return data
}
