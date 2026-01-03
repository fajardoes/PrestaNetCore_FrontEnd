import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import type { LoanProductUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-update.dto'

export const updateLoanProductAction = async (
  id: string,
  payload: LoanProductUpdateDto,
): Promise<ApiResult<LoanProductDetailDto>> => {
  try {
    const result = await loanProductsApi.updateLoanProduct(id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el producto de préstamo.')
  }
}
