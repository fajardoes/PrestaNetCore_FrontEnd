import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanProductStatusUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-status-update.dto'

export const updateLoanProductStatusAction = async (
  id: string,
  payload: LoanProductStatusUpdateDto,
): Promise<ApiResult<void>> => {
  try {
    await loanProductsApi.updateLoanProductStatus(id, payload)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el estado del producto.')
  }
}
