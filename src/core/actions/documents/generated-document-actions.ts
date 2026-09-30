import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import { generatedDocumentsApi } from '@/infrastructure/documents/api/generated-documents-api'
import type {
  GeneratedDocumentEventDto,
  GeneratedDocumentListItemDto,
  GeneratedDocumentPagedResultDto,
  GeneratedDocumentQueryDto,
  GeneratedDocumentRetryDto,
} from '@/infrastructure/documents/dtos/generated-document.dto'

const run = async <T>(fallback: string, action: () => Promise<T>): Promise<ApiResult<T>> => {
  try {
    return { success: true, data: await action() }
  } catch (error) {
    return toApiError(error, fallback)
  }
}

export const generatedDocumentActions = {
  list: (query: GeneratedDocumentQueryDto): Promise<ApiResult<GeneratedDocumentPagedResultDto>> =>
    run('No fue posible cargar el historial documental.', () => generatedDocumentsApi.list(query)),
  get: (id: string): Promise<ApiResult<GeneratedDocumentListItemDto>> =>
    run('No fue posible cargar el detalle del documento.', () => generatedDocumentsApi.get(id)),
  getEvents: (id: string): Promise<ApiResult<GeneratedDocumentEventDto[]>> =>
    run('No fue posible cargar los eventos del documento.', () => generatedDocumentsApi.getEvents(id)),
  download: (id: string): Promise<ApiResult<Blob>> =>
    run('No fue posible recuperar el PDF oficial almacenado.', () => generatedDocumentsApi.download(id)),
  retry: (id: string): Promise<ApiResult<GeneratedDocumentRetryDto>> =>
    run('No fue posible solicitar el retry técnico.', () => generatedDocumentsApi.retry(id)),
}
