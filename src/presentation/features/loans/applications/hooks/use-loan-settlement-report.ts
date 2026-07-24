import { useCallback, useEffect, useRef, useState } from 'react'
import { getLoanSettlementReportAction } from '@/core/actions/loan-applications/get-loan-settlement-report.action'

interface LoanSettlementPreview {
  objectUrl: string
  fileName: string
  contentType: string
  blob: Blob
}

export const useLoanSettlementReport = () => {
  const [preview, setPreview] = useState<LoanSettlementPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const closePreview = useCallback(() => {
    if (objectUrlRef.current) {
      window.URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPreview(null)
    setError(null)
  }, [])

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        window.URL.revokeObjectURL(objectUrlRef.current)
      }
    },
    [],
  )

  const openPreview = useCallback(async (applicationId: string) => {
    setIsLoading(true)
    setError(null)

    const result = await getLoanSettlementReportAction(applicationId)
    if (!result.success) {
      setIsLoading(false)
      setError(result.error)
      return result
    }

    const previewFile =
      typeof File === 'undefined'
        ? result.data.blob
        : new File([result.data.blob], result.data.fileName, {
            type: result.data.contentType,
          })
    const objectUrl = window.URL.createObjectURL(previewFile)
    if (objectUrlRef.current) {
      window.URL.revokeObjectURL(objectUrlRef.current)
    }
    objectUrlRef.current = objectUrl
    setPreview({ ...result.data, objectUrl })
    setIsLoading(false)
    return result
  }, [])

  const download = useCallback(() => {
    if (!preview) return

    setIsDownloading(true)
    const anchor = document.createElement('a')
    anchor.href = preview.objectUrl
    anchor.download = preview.fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setIsDownloading(false)
  }, [preview])

  return {
    preview,
    isLoading,
    isDownloading,
    error,
    openPreview,
    closePreview,
    download,
  }
}
