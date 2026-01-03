import { loanCatalogsApi, type LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogListQueryDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-list-query.dto'

export const listLoanCatalogItemsAction = async (
  catalog: LoanCatalogKey,
  query?: LoanCatalogListQueryDto,
): Promise<ApiResult<LoanCatalogItemDto[]>> => {
  try {
    const result = await loanCatalogsApi.getLoanCatalogItems(catalog, query)
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el catálogo.')
  }
}
