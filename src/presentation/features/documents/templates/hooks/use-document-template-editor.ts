import { useCallback, useState } from 'react'
import { documentTemplateActions } from '@/core/actions/documents/document-template-actions'
import type {
  DocumentTemplateDetailDto,
  DocumentTemplateUpdateRequestDto,
  DocumentTemplateVersionDetailDto,
  DocumentTemplateVersionDraftRequestDto,
  DocumentTemplateVersionSummaryDto,
  DocumentVariableCatalogItemDto,
} from '@/infrastructure/documents/dtos/document-template-admin.dto'

type BusyAction = 'save' | 'validate' | 'preview' | 'pdf' | 'publish' | 'metadata' | 'draft' | null

export const useDocumentTemplateEditor = () => {
  const [template, setTemplate] = useState<DocumentTemplateDetailDto | null>(null)
  const [versions, setVersions] = useState<DocumentTemplateVersionSummaryDto[]>([])
  const [version, setVersion] = useState<DocumentTemplateVersionDetailDto | null>(null)
  const [variables, setVariables] = useState<DocumentVariableCatalogItemDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshVersions = useCallback(async (templateId: string) => {
    const result = await documentTemplateActions.listVersions(templateId)
    if (result.success) setVersions(result.data)
    else setError(result.error)
    return result
  }, [])

  const load = useCallback(async (templateId: string, canReadVariables = true) => {
    setIsLoading(true)
    setError(null)
    setTemplate(null)
    setVersion(null)
    setVersions([])
    setVariables([])
    const templateResult = await documentTemplateActions.getTemplate(templateId)
    if (!templateResult.success) {
      setTemplate(null)
      setError(templateResult.error)
      setIsLoading(false)
      return
    }

    setTemplate(templateResult.data)
    const versionsResult = await documentTemplateActions.listVersions(templateId)
    if (!versionsResult.success) setError(versionsResult.error)
    else setVersions(versionsResult.data)
    if (canReadVariables) {
      const variablesResult = await documentTemplateActions.listVariables(templateResult.data.context)
      if (!variablesResult.success) setError((current) => current ?? variablesResult.error)
      else setVariables(variablesResult.data.filter((item) => item.isActive && item.isVisible))
    }

    if (versionsResult.success && versionsResult.data.length > 0) {
      const selected = versionsResult.data.find((item) => item.status === 'DRAFT') ?? versionsResult.data[0]
      const versionResult = await documentTemplateActions.getVersion(templateId, selected.id)
      if (versionResult.success) setVersion(versionResult.data)
      else setError((current) => current ?? versionResult.error)
    } else {
      setVersion(null)
    }
    setIsLoading(false)
  }, [])

  const selectVersion = useCallback(async (templateId: string, versionId: string) => {
    setError(null)
    const result = await documentTemplateActions.getVersion(templateId, versionId)
    if (result.success) setVersion(result.data)
    else setError(result.error)
    return result
  }, [])

  const updateMetadata = useCallback(async (templateId: string, payload: DocumentTemplateUpdateRequestDto) => {
    setBusyAction('metadata')
    const result = await documentTemplateActions.updateTemplate(templateId, payload)
    if (result.success) setTemplate(result.data)
    else setError(result.error)
    setBusyAction(null)
    return result
  }, [])

  const createDraft = useCallback(async (templateId: string, payload: DocumentTemplateVersionDraftRequestDto) => {
    setBusyAction('draft')
    const result = await documentTemplateActions.createDraft(templateId, payload)
    if (result.success) {
      setVersion(result.data)
      await refreshVersions(templateId)
    } else setError(result.error)
    setBusyAction(null)
    return result
  }, [refreshVersions])

  const saveDraft = useCallback(async (templateId: string, versionId: string, payload: DocumentTemplateVersionDraftRequestDto) => {
    setBusyAction('save')
    const result = await documentTemplateActions.updateDraft(templateId, versionId, payload)
    if (result.success) {
      setVersion(result.data)
      await refreshVersions(templateId)
    } else setError(result.error)
    setBusyAction(null)
    return result
  }, [refreshVersions])

  const validateDraft = useCallback(async (templateId: string, versionId: string, requiredVariableCodes: string[]) => {
    setBusyAction('validate')
    const result = await documentTemplateActions.validateDraft(templateId, versionId, { requiredVariableCodes })
    if (result.success) {
      setVersion((current) => current ? { ...current, validation: result.data, isValid: result.data.isValid } : current)
      await refreshVersions(templateId)
    } else setError(result.error)
    setBusyAction(null)
    return result
  }, [refreshVersions])

  const previewHtml = useCallback(async (templateId: string, versionId: string) => {
    setBusyAction('preview')
    const result = await documentTemplateActions.previewHtml(templateId, versionId)
    if (!result.success) setError(result.error)
    setBusyAction(null)
    return result
  }, [])

  const previewPdf = useCallback(async (templateId: string, versionId: string) => {
    setBusyAction('pdf')
    const result = await documentTemplateActions.previewPdf(templateId, versionId)
    if (!result.success) setError(result.error)
    setBusyAction(null)
    return result
  }, [])

  const publish = useCallback(async (templateId: string, versionId: string) => {
    setBusyAction('publish')
    const result = await documentTemplateActions.publish(templateId, versionId)
    if (result.success) {
      setVersion(result.data.version)
      await refreshVersions(templateId)
    } else setError(result.error)
    setBusyAction(null)
    return result
  }, [refreshVersions])

  return {
    template,
    versions,
    version,
    variables,
    isLoading,
    busyAction,
    error,
    load,
    selectVersion,
    updateMetadata,
    createDraft,
    saveDraft,
    validateDraft,
    previewHtml,
    previewPdf,
    publish,
    refreshVersions,
  }
}
