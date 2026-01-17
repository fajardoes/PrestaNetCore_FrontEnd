import { loanCatalogsApi, type LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogUpdateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-update.dto'

export const updateLoanCatalogItemAction = async (
  catalog: LoanCatalogKey,
  id: string,
  payload: LoanCatalogUpdateDto,
): Promise<ApiResult<LoanCatalogItemDto>> => {
  try {
    const result = await loanCatalogsApi.updateLoanCatalogItem(catalog, id, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el registro del catálogo.')
  }
}
