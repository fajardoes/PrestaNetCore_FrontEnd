import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import type { LoanProductCreateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-create.dto'

export const createLoanProductAction = async (
  payload: LoanProductCreateDto,
): Promise<ApiResult<LoanProductDetailDto>> => {
  try {
    const result = await loanProductsApi.createLoanProduct(payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el producto de préstamo.')
  }
}
