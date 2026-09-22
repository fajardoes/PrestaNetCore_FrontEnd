import { useCallback, useEffect, useRef, useState } from 'react'
import { getJournalEntryVoucherReportAction } from '@/core/actions/accounting/get-journal-entry-voucher-report.action'

interface JournalEntryVoucherPreview {
  objectUrl: string
  fileName: string
  contentType: string
  blob: Blob
}

export const useJournalEntryVoucherReport = () => {
  const [preview, setPreview] = useState<JournalEntryVoucherPreview | null>(null)
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

  const openPreview = useCallback(async (journalEntryId: string) => {
    setIsLoading(true)
    setError(null)

    const result = await getJournalEntryVoucherReportAction(journalEntryId)
    if (!result.success) {
      setIsLoading(false)
      setError(result.error)
      return result
    }

    const objectUrl = window.URL.createObjectURL(result.data.blob)
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
