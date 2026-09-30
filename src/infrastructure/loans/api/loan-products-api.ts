import { httpClient } from '@/infrastructure/api/httpClient'
import type { AxiosRequestConfig } from 'axios'
import type { LoanProductListQueryDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-query.dto'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import type { LoanProductCreateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-create.dto'
import type { LoanProductUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-update.dto'
import type { LoanProductStatusUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-status-update.dto'
import type {
  LoanProductDocumentRequirementEventDto,
  LoanProductDocumentRequirementsDto,
  LoanProductDocumentRequirementsUpdateRequestDto,
  LoanProductDocumentTemplateOptionDto,
} from '@/infrastructure/loans/dtos/loan-products/loan-product-document-requirement.dto'

const basePath = '/loans/products'

export const loanProductsApi = {
  async getLoanProducts(
    query: LoanProductListQueryDto,
    requestConfig?: AxiosRequestConfig,
  ): Promise<LoanProductListItemDto[]> {
    const { data } = await httpClient.get<LoanProductListItemDto[]>(basePath, {
      params: query,
      ...requestConfig,
    })
    return data
  },

  async getLoanProductById(
    id: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<LoanProductDetailDto> {
    const { data } = await httpClient.get<LoanProductDetailDto>(
      `${basePath}/${id}`,
      requestConfig,
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

  async getLoanProductDocumentRequirements(id: string): Promise<LoanProductDocumentRequirementsDto> {
    const { data } = await httpClient.get<LoanProductDocumentRequirementsDto>(
      `${basePath}/${id}/documents`,
    )
    return data
  },

  async getLoanProductDocumentTemplateOptions(
    id: string,
    search?: string,
  ): Promise<LoanProductDocumentTemplateOptionDto[]> {
    const { data } = await httpClient.get<LoanProductDocumentTemplateOptionDto[]>(
      `${basePath}/${id}/documents/templates`,
      { params: search ? { search } : undefined },
    )
    return data
  },

  async getLoanProductDocumentRequirementEvents(
    id: string,
    take = 100,
  ): Promise<LoanProductDocumentRequirementEventDto[]> {
    const { data } = await httpClient.get<LoanProductDocumentRequirementEventDto[]>(
      `${basePath}/${id}/documents/events`,
      { params: { take } },
    )
    return data
  },

  async replaceLoanProductDocumentRequirements(
    id: string,
    payload: LoanProductDocumentRequirementsUpdateRequestDto,
  ): Promise<LoanProductDocumentRequirementsDto> {
    const { data } = await httpClient.put<LoanProductDocumentRequirementsDto>(
      `${basePath}/${id}/documents`,
      payload,
    )
    return data
  },
}
