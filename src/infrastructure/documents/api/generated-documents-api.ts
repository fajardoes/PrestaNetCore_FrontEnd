import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  GeneratedDocumentEventDto,
  GeneratedDocumentListItemDto,
  GeneratedDocumentPagedResultDto,
  GeneratedDocumentQueryDto,
  GeneratedDocumentRetryDto,
} from '@/infrastructure/documents/dtos/generated-document.dto'

const basePath = '/documents/generated'

export const generatedDocumentsApi = {
  async list(query: GeneratedDocumentQueryDto): Promise<GeneratedDocumentPagedResultDto> {
    const { data } = await httpClient.get<GeneratedDocumentPagedResultDto>(basePath, { params: query })
    return data
  },

  async get(id: string): Promise<GeneratedDocumentListItemDto> {
    const { data } = await httpClient.get<GeneratedDocumentListItemDto>(`${basePath}/${id}`)
    return data
  },

  async getEvents(id: string): Promise<GeneratedDocumentEventDto[]> {
    const { data } = await httpClient.get<GeneratedDocumentEventDto[]>(`${basePath}/${id}/events`)
    return data
  },

  async download(id: string): Promise<Blob> {
    const { data } = await httpClient.get<Blob>(`${basePath}/${id}/download`, {
      responseType: 'blob',
    })
    return data
  },

  async retry(id: string): Promise<GeneratedDocumentRetryDto> {
    const { data } = await httpClient.post<GeneratedDocumentRetryDto>(`${basePath}/${id}/retry`)
    return data
  },
}
