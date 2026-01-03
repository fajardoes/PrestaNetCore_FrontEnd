import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanProductListQueryDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-query.dto'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import type { LoanProductCreateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-create.dto'
import type { LoanProductUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-update.dto'
import type { LoanProductStatusUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-status-update.dto'

const basePath = '/loans/products'

export const loanProductsApi = {
  async getLoanProducts(
    query: LoanProductListQueryDto,
  ): Promise<LoanProductListItemDto[]> {
    const { data } = await httpClient.get<LoanProductListItemDto[]>(basePath, {
      params: query,
    })
    return data
  },

  async getLoanProductById(id: string): Promise<LoanProductDetailDto> {
    const { data } = await httpClient.get<LoanProductDetailDto>(
      `${basePath}/${id}`,
    )
    return data
  },

  async createLoanProduct(
    payload: LoanProductCreateDto,
  ): Promise<LoanProductDetailDto> {
    const { data } = await httpClient.post<LoanProductDetailDto>(
      basePath,
      payload,
    )
    return data
  },

  async updateLoanProduct(
    id: string,
    payload: LoanProductUpdateDto,
  ): Promise<LoanProductDetailDto> {
    const { data } = await httpClient.put<LoanProductDetailDto>(
      `${basePath}/${id}`,
      payload,
    )
    return data
  },

  async updateLoanProductStatus(
    id: string,
    payload: LoanProductStatusUpdateDto,
  ): Promise<void> {
    await httpClient.patch(`${basePath}/${id}/status`, payload)
  },
}
