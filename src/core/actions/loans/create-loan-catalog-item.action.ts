import { loanCatalogsApi, type LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogCreateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-create.dto'

export const createLoanCatalogItemAction = async (
  catalog: LoanCatalogKey,
  payload: LoanCatalogCreateDto,
): Promise<ApiResult<LoanCatalogItemDto>> => {
  try {
    const result = await loanCatalogsApi.createLoanCatalogItem(catalog, payload)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el registro del catálogo.')
  }
}
