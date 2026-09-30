import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  DocumentTemplateCreateRequestDto,
  DocumentTemplateDetailDto,
  DocumentTemplateListItemDto,
  DocumentTemplatePreviewDto,
  DocumentTemplatePublishResultDto,
  DocumentTemplateUpdateRequestDto,
  DocumentTemplateValidationDto,
  DocumentTemplateVersionDetailDto,
  DocumentTemplateVersionDraftRequestDto,
  DocumentTemplateVersionSummaryDto,
  DocumentTemplateVersionValidationRequestDto,
  DocumentTypeListItemDto,
  DocumentVariableCatalogItemDto,
} from '@/infrastructure/documents/dtos/document-template-admin.dto'

const basePath = '/documents/templates'

export const documentTemplatesApi = {
  async getTypes(rootContext?: string): Promise<DocumentTypeListItemDto[]> {
    const { data } = await httpClient.get<DocumentTypeListItemDto[]>(`${basePath}/types`, {
      params: rootContext ? { rootContext } : undefined,
    })
    return data
  },

  async getVariables(rootContext: string): Promise<DocumentVariableCatalogItemDto[]> {
    const { data } = await httpClient.get<DocumentVariableCatalogItemDto[]>(`${basePath}/variables`, {
      params: { rootContext },
    })
    return data
  },

  async getTemplates(query: {
    search?: string
    rootContext?: string
    isActive?: boolean
  }): Promise<DocumentTemplateListItemDto[]> {
    const { data } = await httpClient.get<DocumentTemplateListItemDto[]>(basePath, { params: query })
    return data
  },

  async getTemplate(id: string): Promise<DocumentTemplateDetailDto> {
    const { data } = await httpClient.get<DocumentTemplateDetailDto>(`${basePath}/${id}`)
    return data
  },

  async createTemplate(payload: DocumentTemplateCreateRequestDto): Promise<DocumentTemplateDetailDto> {
    const { data } = await httpClient.post<DocumentTemplateDetailDto>(basePath, payload)
    return data
  },

  async updateTemplate(
    id: string,
    payload: DocumentTemplateUpdateRequestDto,
  ): Promise<DocumentTemplateDetailDto> {
    const { data } = await httpClient.put<DocumentTemplateDetailDto>(`${basePath}/${id}`, payload)
    return data
  },

  async getVersions(templateId: string): Promise<DocumentTemplateVersionSummaryDto[]> {
    const { data } = await httpClient.get<DocumentTemplateVersionSummaryDto[]>(`${basePath}/${templateId}/versions`)
    return data
  },

  async getVersion(templateId: string, versionId: string): Promise<DocumentTemplateVersionDetailDto> {
    const { data } = await httpClient.get<DocumentTemplateVersionDetailDto>(
      `${basePath}/${templateId}/versions/${versionId}`,
    )
    return data
  },

  async createDraft(
    templateId: string,
    payload: DocumentTemplateVersionDraftRequestDto,
  ): Promise<DocumentTemplateVersionDetailDto> {
    const { data } = await httpClient.post<DocumentTemplateVersionDetailDto>(
      `${basePath}/${templateId}/versions`,
      payload,
    )
    return data
  },

  async updateDraft(
    templateId: string,
    versionId: string,
    payload: DocumentTemplateVersionDraftRequestDto,
  ): Promise<DocumentTemplateVersionDetailDto> {
    const { data } = await httpClient.put<DocumentTemplateVersionDetailDto>(
      `${basePath}/${templateId}/versions/${versionId}`,
      payload,
    )
    return data
  },

  async validateDraft(
    templateId: string,
    versionId: string,
    payload: DocumentTemplateVersionValidationRequestDto,
  ): Promise<DocumentTemplateValidationDto> {
    const { data } = await httpClient.post<DocumentTemplateValidationDto>(
      `${basePath}/${templateId}/versions/${versionId}/validate`,
      payload,
    )
    return data
  },

  async previewHtml(templateId: string, versionId: string): Promise<DocumentTemplatePreviewDto> {
    const { data } = await httpClient.post<DocumentTemplatePreviewDto>(
      `${basePath}/${templateId}/versions/${versionId}/preview`,
    )
    return data
  },

  async previewPdf(templateId: string, versionId: string): Promise<Blob> {
    const { data } = await httpClient.post<Blob>(
      `${basePath}/${templateId}/versions/${versionId}/preview-pdf`,
      {},
      { responseType: 'blob' },
    )
    return data
  },

  async publish(templateId: string, versionId: string): Promise<DocumentTemplatePublishResultDto> {
    const { data } = await httpClient.post<DocumentTemplatePublishResultDto>(
      `${basePath}/${templateId}/versions/${versionId}/publish`,
    )
    return data
  },
}
