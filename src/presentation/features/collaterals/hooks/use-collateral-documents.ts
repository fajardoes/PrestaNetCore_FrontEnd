import { useCallback, useState } from 'react'
import { deleteCollateralDocumentAction } from '@/core/actions/collaterals/delete-collateral-document-action'
import { listCollateralDocumentsAction } from '@/core/actions/collaterals/list-collateral-documents-action'
import { uploadCollateralDocumentAction } from '@/core/actions/collaterals/upload-collateral-document-action'
import type { CollateralDocumentResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-document-response'
import { prestanetApi } from '@/infrastructure/api/prestanet-api'

const normalizeDownloadUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = prestanetApi.defaults.baseURL ?? ''
  if (!baseUrl) return url
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`

  if (normalizedUrl.startsWith('/api/') && normalizedBase.endsWith('/api')) {
    return `${normalizedBase.slice(0, -4)}${normalizedUrl}`
  }

  return `${normalizedBase}${normalizedUrl}`
}

export const useCollateralDocuments = () => {
  const [documents, setDocuments] = useState<CollateralDocumentResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (collateralId: string) => {
    setIsLoading(true)
    setError(null)

    const result = await listCollateralDocumentsAction(collateralId)
    if (result.success) {
      setDocuments(
        result.data.map((item) => ({
          ...item,
          downloadUrl: normalizeDownloadUrl(item.downloadUrl),
        })),
      )
      setIsLoading(false)
      return result
    }

    setDocuments([])
    setError(result.error)
    setIsLoading(false)
    return result
  }, [])

  const upload = useCallback(
    async (collateralId: string, file: File, documentType: string) => {
      setIsUploading(true)
      setError(null)
      const result = await uploadCollateralDocumentAction(collateralId, {
        file,
        documentType,
      })

      if (!result.success) {
        setError(result.error)
      }

      setIsUploading(false)
      return result
    },
    [],
  )

  const remove = useCallback(async (collateralId: string, documentId: string) => {
    setIsDeleting(true)
    setError(null)

    const result = await deleteCollateralDocumentAction(collateralId, documentId)
    if (!result.success) {
      setError(result.error)
    }

    setIsDeleting(false)
    return result
  }, [])

  const requestDocumentFile = useCallback(
    async (downloadUrl: string, fallbackFileName: string) => {
      const response = await prestanetApi.get<Blob>(downloadUrl, {
        responseType: 'blob',
      })

      const contentDisposition = response.headers?.['content-disposition']
      const fileName =
        getFileNameFromContentDisposition(contentDisposition) || fallbackFileName
      const contentType =
        response.headers?.['content-type'] || response.data.type || ''

      return {
        blob: response.data,
        fileName,
        contentType,
      }
    },
    [],
  )

  const download = useCallback(async (downloadUrl: string, fallbackFileName: string) => {
    setIsDownloading(true)
    setError(null)

    try {
      const file = await requestDocumentFile(downloadUrl, fallbackFileName)

      const objectUrl = window.URL.createObjectURL(file.blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = file.fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(objectUrl)

      setIsDownloading(false)
      return { success: true as const }
    } catch {
      const message = 'No fue posible descargar el documento.'
      setError(message)
      setIsDownloading(false)
      return { success: false as const, error: message }
    }
  }, [requestDocumentFile])

  const preview = useCallback(async (downloadUrl: string, fallbackFileName: string) => {
    setIsPreviewing(true)
    setError(null)

    try {
      const file = await requestDocumentFile(downloadUrl, fallbackFileName)
      const objectUrl = window.URL.createObjectURL(file.blob)

      setIsPreviewing(false)
      return {
        success: true as const,
        data: {
          objectUrl,
          fileName: file.fileName,
          contentType: file.contentType,
        },
      }
    } catch {
      const message = 'No fue posible visualizar el documento.'
      setError(message)
      setIsPreviewing(false)
      return { success: false as const, error: message }
    }
  }, [requestDocumentFile])

  return {
    documents,
    isLoading,
    isUploading,
    isDeleting,
    isDownloading,
    isPreviewing,
    error,
    load,
    upload,
    remove,
    download,
    preview,
  }
}

const getFileNameFromContentDisposition = (header?: string) => {
  if (!header) return null
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const asciiMatch = header.match(/filename="?([^"]+)"?/i)
  return asciiMatch?.[1] ?? null
}
