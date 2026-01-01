import { useCallback, useState } from 'react'
import { postJournalEntryAction } from '@/core/actions/accounting/post-journal-entry.action'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'

interface UsePostJournalEntryOptions {
  onCompleted?: (entry: JournalEntryDetail) => void
}

export const usePostJournalEntry = (options?: UsePostJournalEntryOptions) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postEntry = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      const result = await postJournalEntryAction(id)
      if (result.success) {
        options?.onCompleted?.(result.data)
        setIsLoading(false)
        return { success: true, data: result.data }
      }
      setError(result.error)
      setIsLoading(false)
      return { success: false, error: result.error }
    },
    [options],
  )

  return {
    postEntry,
    isLoading,
    error,
  }
}
