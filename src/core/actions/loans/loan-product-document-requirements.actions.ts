import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import { loanProductsApi } from '@/infrastructure/loans/api/loan-products-api'
import type {
  LoanProductDocumentRequirementEventDto,
  LoanProductDocumentRequirementsDto,
  LoanProductDocumentRequirementsUpdateRequestDto,
  LoanProductDocumentTemplateOptionDto,
} from '@/infrastructure/loans/dtos/loan-products/loan-product-document-requirement.dto'

const fallback = 'No fue posible cargar la configuración documental del producto.'

export const loanProductDocumentRequirementsActions = {
  async get(productId: string): Promise<ApiResult<LoanProductDocumentRequirementsDto>> {
    try {
      return { success: true, data: await loanProductsApi.getLoanProductDocumentRequirements(productId) }
    } catch (error) {
      return toApiError(error, fallback)
    }
  },

  async getTemplates(productId: string): Promise<ApiResult<LoanProductDocumentTemplateOptionDto[]>> {
    try {
      return { success: true, data: await loanProductsApi.getLoanProductDocumentTemplateOptions(productId) }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar las plantillas documentales disponibles.')
    }
  },

  async getEvents(productId: string): Promise<ApiResult<LoanProductDocumentRequirementEventDto[]>> {
    try {
      return { success: true, data: await loanProductsApi.getLoanProductDocumentRequirementEvents(productId) }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar el historial de cambios documentales.')
    }
  },

  async replace(
    productId: string,
    payload: LoanProductDocumentRequirementsUpdateRequestDto,
  ): Promise<ApiResult<LoanProductDocumentRequirementsDto>> {
    try {
      return {
        success: true,
        data: await loanProductsApi.replaceLoanProductDocumentRequirements(productId, payload),
      }
    } catch (error) {
      return toApiError(error, 'No fue posible guardar los requisitos documentales.')
    }
  },
}
