import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import { documentTemplatesApi } from '@/infrastructure/documents/api/document-templates-api'
import type {
  DocumentTemplateCreateRequestDto,
  DocumentTemplateUpdateRequestDto,
  DocumentTemplateVersionDraftRequestDto,
  DocumentTemplateVersionValidationRequestDto,
} from '@/infrastructure/documents/dtos/document-template-admin.dto'

const run = async <T>(fallback: string, action: () => Promise<T>): Promise<ApiResult<T>> => {
  try {
    return { success: true, data: await action() }
  } catch (error) {
    return toApiError(error, fallback)
  }
}

export const documentTemplateActions = {
  listTypes: (rootContext?: string) =>
    run('No fue posible cargar los tipos documentales.', () => documentTemplatesApi.getTypes(rootContext)),
  listVariables: (rootContext: string) =>
    run('No fue posible cargar el catálogo de variables.', () => documentTemplatesApi.getVariables(rootContext)),
  listTemplates: (query: { search?: string; rootContext?: string; isActive?: boolean }) =>
    run('No fue posible cargar las plantillas documentales.', () => documentTemplatesApi.getTemplates(query)),
  getTemplate: (id: string) =>
    run('No fue posible cargar la plantilla documental.', () => documentTemplatesApi.getTemplate(id)),
  createTemplate: (payload: DocumentTemplateCreateRequestDto) =>
    run('No fue posible crear la plantilla documental.', () => documentTemplatesApi.createTemplate(payload)),
  updateTemplate: (id: string, payload: DocumentTemplateUpdateRequestDto) =>
    run('No fue posible actualizar la plantilla documental.', () => documentTemplatesApi.updateTemplate(id, payload)),
  listVersions: (templateId: string) =>
    run('No fue posible cargar las versiones.', () => documentTemplatesApi.getVersions(templateId)),
  getVersion: (templateId: string, versionId: string) =>
    run('No fue posible cargar la versión.', () => documentTemplatesApi.getVersion(templateId, versionId)),
  createDraft: (templateId: string, payload: DocumentTemplateVersionDraftRequestDto) =>
    run('No fue posible crear la versión borrador.', () => documentTemplatesApi.createDraft(templateId, payload)),
  updateDraft: (templateId: string, versionId: string, payload: DocumentTemplateVersionDraftRequestDto) =>
    run('No fue posible guardar la versión borrador.', () => documentTemplatesApi.updateDraft(templateId, versionId, payload)),
  validateDraft: (templateId: string, versionId: string, payload: DocumentTemplateVersionValidationRequestDto) =>
    run('No fue posible validar la versión.', () => documentTemplatesApi.validateDraft(templateId, versionId, payload)),
  previewHtml: (templateId: string, versionId: string) =>
    run('No fue posible generar la vista previa HTML.', () => documentTemplatesApi.previewHtml(templateId, versionId)),
  previewPdf: (templateId: string, versionId: string) =>
    run('No fue posible generar el PDF temporal.', () => documentTemplatesApi.previewPdf(templateId, versionId)),
  publish: (templateId: string, versionId: string) =>
    run('No fue posible publicar la versión.', () => documentTemplatesApi.publish(templateId, versionId)),
}
