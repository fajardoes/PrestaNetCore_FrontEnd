import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogCreateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-create.dto'
import type { LoanCatalogUpdateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-update.dto'
import type { LoanCatalogStatusUpdateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-status-update.dto'
import type { LoanCatalogListQueryDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-list-query.dto'

export type LoanCatalogKey =
  | 'term-units'
  | 'interest-rate-types'
  | 'rate-bases'
  | 'amortization-methods'
  | 'payment-frequencies'
  | 'portfolio-types'
  | 'fee-types'
  | 'fee-charge-bases'
  | 'fee-value-types'
  | 'fee-charge-timings'
  | 'insurance-types'
  | 'insurance-calculation-bases'
  | 'insurance-coverage-periods'
  | 'insurance-charge-timings'
  | 'collateral-types'

const basePath = '/loans/catalogs'

export const loanCatalogsApi = {
  async getLoanCatalogItems(
    catalog: LoanCatalogKey,
    query?: LoanCatalogListQueryDto,
  ): Promise<LoanCatalogItemDto[]> {
    const { data } = await httpClient.get<LoanCatalogItemDto[]>(
      `${basePath}/${catalog}`,
      {
        params: query ?? {},
      },
    )
    return data
  },

  async createLoanCatalogItem(
    catalog: LoanCatalogKey,
    payload: LoanCatalogCreateDto,
  ): Promise<LoanCatalogItemDto> {
    const { data } = await httpClient.post<LoanCatalogItemDto>(
      `${basePath}/${catalog}`,
      payload,
    )
    return data
  },

  async updateLoanCatalogItem(
    catalog: LoanCatalogKey,
    id: string,
    payload: LoanCatalogUpdateDto,
  ): Promise<LoanCatalogItemDto> {
    const { data } = await httpClient.put<LoanCatalogItemDto>(
      `${basePath}/${catalog}/${id}`,
      payload,
    )
    return data
  },

  async updateLoanCatalogItemStatus(
    catalog: LoanCatalogKey,
    id: string,
    payload: LoanCatalogStatusUpdateDto,
  ): Promise<void> {
    await httpClient.patch(`${basePath}/${catalog}/${id}/status`, payload)
  },
}
