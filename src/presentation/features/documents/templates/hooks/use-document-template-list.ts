import { useCallback, useEffect, useState } from 'react'
import { documentTemplateActions } from '@/core/actions/documents/document-template-actions'
import type {
  DocumentTemplateCreateRequestDto,
  DocumentTemplateListItemDto,
  DocumentTypeListItemDto,
} from '@/infrastructure/documents/dtos/document-template-admin.dto'

export const useDocumentTemplateList = (enabled: boolean) => {
  const [items, setItems] = useState<DocumentTemplateListItemDto[]>([])
  const [types, setTypes] = useState<DocumentTypeListItemDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (query: {
    search?: string
    rootContext?: string
    isActive?: boolean
  } = {}) => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    const [typeResult, templateResult] = await Promise.all([
      documentTemplateActions.listTypes(),
      documentTemplateActions.listTemplates(query),
    ])
    if (typeResult.success) setTypes(typeResult.data)
    else setError(typeResult.error)
    if (templateResult.success) setItems(templateResult.data)
    else setError((current) => current ?? templateResult.error)
    setIsLoading(false)
  }, [enabled])

  const create = useCallback(async (payload: DocumentTemplateCreateRequestDto) => {
    setIsSaving(true)
    setError(null)
    const result = await documentTemplateActions.createTemplate(payload)
    if (!result.success) setError(result.error)
    setIsSaving(false)
    return result
  }, [])

  useEffect(() => {
    if (enabled) void load()
  }, [enabled, load])

  return { items, types, isLoading, isSaving, error, load, create }
}
