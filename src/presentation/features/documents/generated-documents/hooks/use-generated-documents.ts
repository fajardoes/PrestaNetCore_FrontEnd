import { useCallback, useEffect, useRef, useState } from 'react'
import { generatedDocumentActions } from '@/core/actions/documents/generated-document-actions'
import type {
  GeneratedDocumentEventDto,
  GeneratedDocumentFailureType,
  GeneratedDocumentListItemDto,
  GeneratedDocumentPagedResultDto,
  GeneratedDocumentStatus,
} from '@/infrastructure/documents/dtos/generated-document.dto'

const DEFAULT_PAGE_SIZE = 10

interface UseGeneratedDocumentsOptions {
  enabled: boolean
  loanApplicationId?: string
  loanId?: string
}

export const useGeneratedDocuments = ({
  enabled,
  loanApplicationId,
  loanId,
}: UseGeneratedDocumentsOptions) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [status, setStatus] = useState<'ALL' | GeneratedDocumentStatus>('ALL')
  const [result, setResult] = useState<GeneratedDocumentPagedResultDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocumentListItemDto | null>(null)
  const [events, setEvents] = useState<GeneratedDocumentEventDto[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ id: string; fileName: string; url: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const listRequestSequence = useRef(0)
  const detailRequestSequence = useRef(0)
  const previewRequestSequence = useRef(0)
  const previewUrl = preview?.url
  const currentScopeKey = loanApplicationId ?? loanId ?? ''
  const previousScopeKey = useRef(currentScopeKey)

  const load = useCallback(async () => {
    const requestSequence = ++listRequestSequence.current
    if (previousScopeKey.current !== currentScopeKey) {
      previousScopeKey.current = currentScopeKey
      setResult(null)
    }
    if (!enabled || (!loanApplicationId && !loanId)) {
      setResult(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    const response = await generatedDocumentActions.list({
      ...(loanApplicationId ? { loanApplicationId } : loanId ? { loanId } : {}),
      ...(status !== 'ALL' ? { status } : {}),
      pageNumber: page,
      pageSize,
    })
    if (requestSequence !== listRequestSequence.current) return
    if (response.success) {
      setResult(response.data)
    } else {
      setError(response.error)
    }
    setIsLoading(false)
  }, [currentScopeKey, enabled, loanApplicationId, loanId, page, pageSize, status])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const changeStatus = useCallback((value: 'ALL' | GeneratedDocumentStatus) => {
    setStatus(value)
    setPage(1)
  }, [])

  const changePageSize = useCallback((value: number) => {
    setPageSize(value)
    setPage(1)
  }, [])

  const openDetails = useCallback(async (document: GeneratedDocumentListItemDto) => {
    const requestSequence = ++detailRequestSequence.current
    setSelectedDocument(document)
    setEvents([])
    setDetailError(null)
    setDetailLoading(true)
    const [detailResponse, eventsResponse] = await Promise.all([
      generatedDocumentActions.get(document.id),
      generatedDocumentActions.getEvents(document.id),
    ])
    if (requestSequence !== detailRequestSequence.current) return
    if (detailResponse.success) setSelectedDocument(detailResponse.data)
    else setDetailError(detailResponse.error)
    if (eventsResponse.success) setEvents(eventsResponse.data)
    else setDetailError((current) => current ?? eventsResponse.error)
    setDetailLoading(false)
  }, [])

  const closeDetails = useCallback(() => {
    detailRequestSequence.current += 1
    setSelectedDocument(null)
    setEvents([])
    setDetailLoading(false)
    setDetailError(null)
  }, [])

  const viewPdf = useCallback(async (document: GeneratedDocumentListItemDto) => {
    const requestSequence = ++previewRequestSequence.current
    setPreviewError(null)
    setPreviewLoading(true)
    setPreview({ id: document.id, fileName: document.fileName ?? 'documento-oficial.pdf', url: '' })
    const response = await generatedDocumentActions.download(document.id)
    if (requestSequence !== previewRequestSequence.current) return
    if (!response.success) {
      setPreviewError(response.error)
      setPreviewLoading(false)
      setPreview({ id: document.id, fileName: document.fileName ?? 'documento-oficial.pdf', url: '' })
      return
    }
    setPreview({
      id: document.id,
      fileName: document.fileName ?? 'documento-oficial.pdf',
      url: URL.createObjectURL(response.data),
    })
    setPreviewLoading(false)
  }, [])

  const closePreview = useCallback(() => {
    previewRequestSequence.current += 1
    setPreview(null)
    setPreviewError(null)
    setPreviewLoading(false)
  }, [])

  const downloadPdf = useCallback(async (id: string, fileName: string | null) => {
    setDownloadingId(id)
    setActionError(null)
    const response = await generatedDocumentActions.download(id)
    if (!response.success) {
      setActionError(response.error)
      setDownloadingId(null)
      return
    }

    const url = URL.createObjectURL(response.data)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName ?? 'documento-oficial.pdf'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setDownloadingId(null)
  }, [])

  const retry = useCallback(async (document: GeneratedDocumentListItemDto) => {
    setRetryingId(document.id)
    setActionError(null)
    const response = await generatedDocumentActions.retry(document.id)
    if (!response.success) {
      setActionError(response.error)
    } else {
      setActionError(response.data.status === 'GENERATED'
        ? 'El documento se recuperó y el PDF quedó disponible.'
        : response.data.errorSummary ?? 'El retry terminó; revisa el estado actualizado del documento.')
    }
    await load()
    setRetryingId(null)
  }, [load])

  return {
    items: result?.items ?? [],
    totalCount: result?.totalCount ?? 0,
    page,
    pageSize,
    status,
    totalPages: Math.max(1, Math.ceil((result?.totalCount ?? 0) / pageSize)),
    isLoading,
    error,
    actionError,
    retryingId,
    selectedDocument,
    events,
    detailLoading,
    detailError,
    preview,
    previewLoading,
    previewError,
    downloadingId,
    refresh: load,
    setPage,
    setPageSize: changePageSize,
    setStatus: changeStatus,
    openDetails,
    closeDetails,
    viewPdf,
    closePreview,
    downloadPdf,
    retry,
  }
}

export type GeneratedDocumentsState = ReturnType<typeof useGeneratedDocuments>

export const generatedDocumentFailureLabel = (failureType: GeneratedDocumentFailureType | null) => {
  switch (failureType) {
    case 'MISSING_REQUIRED_CONTEXT': return 'Contexto requerido incompleto'
    case 'RENDERER_ERROR': return 'Fallo del renderer'
    case 'STORAGE_ERROR': return 'Fallo de almacenamiento'
    case 'RENDERING_TIMEOUT': return 'Tiempo de generación excedido'
    case 'UNKNOWN': return 'Fallo no clasificado'
    default: return 'Sin clasificación'
  }
}
