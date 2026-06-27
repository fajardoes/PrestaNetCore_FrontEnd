import { useCallback, useState } from 'react'
import { httpClient } from '@/infrastructure/api/httpClient'

const normalizeDownloadUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = httpClient.defaults.baseURL ?? ''
  if (!baseUrl) return url
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`

  if (normalizedUrl.startsWith('/api/') && normalizedBase.endsWith('/api')) {
    return `${normalizedBase.slice(0, -4)}${normalizedUrl}`
  }

  return `${normalizedBase}${normalizedUrl}`
}

export const useBankPaymentProofDocument = () => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestFile = useCallback(
    async (downloadUrl: string, fallbackFileName: string) => {
      const response = await httpClient.get<Blob>(normalizeDownloadUrl(downloadUrl), {
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
      const file = await requestFile(downloadUrl, fallbackFileName)
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
      const message = 'No fue posible descargar el comprobante.'
      setError(message)
      setIsDownloading(false)
      return { success: false as const, error: message }
    }
  }, [requestFile])

  const preview = useCallback(async (downloadUrl: string, fallbackFileName: string) => {
    setIsPreviewing(true)
    setError(null)

    try {
      const file = await requestFile(downloadUrl, fallbackFileName)
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
      const message = 'No fue posible visualizar el comprobante.'
      setError(message)
      setIsPreviewing(false)
      return { success: false as const, error: message }
    }
  }, [requestFile])

  return {
    isDownloading,
    isPreviewing,
    error,
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
