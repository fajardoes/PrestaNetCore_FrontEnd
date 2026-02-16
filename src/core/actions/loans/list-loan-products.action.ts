import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { LoanProductListQueryDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-query.dto'

export const listLoanProductsAction = async (
  query: LoanProductListQueryDto,
  options?: { silent?: boolean },
): Promise<ApiResult<LoanProductListItemDto[]>> => {
  try {
    const result = await loanProductsApi.getLoanProducts(
      query,
      options?.silent ? { skipGlobalLoading: true } : undefined,
    )
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el listado de productos.')
  }
}
