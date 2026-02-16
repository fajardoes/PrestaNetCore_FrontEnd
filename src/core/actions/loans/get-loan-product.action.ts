import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'

export const getLoanProductAction = async (
  id: string,
  options?: { silent?: boolean },
): Promise<ApiResult<LoanProductDetailDto>> => {
  try {
    const result = await loanProductsApi.getLoanProductById(
      id,
      options?.silent ? { skipGlobalLoading: true } : undefined,
    )
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el producto de préstamo.')
  }
}
