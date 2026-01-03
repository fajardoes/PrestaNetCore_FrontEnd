import { loanCatalogsApi, type LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanCatalogStatusUpdateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-status-update.dto'

export const updateLoanCatalogStatusAction = async (
  catalog: LoanCatalogKey,
  id: string,
  payload: LoanCatalogStatusUpdateDto,
): Promise<ApiResult<void>> => {
  try {
    await loanCatalogsApi.updateLoanCatalogItemStatus(catalog, id, payload)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el estado del catálogo.')
  }
}
