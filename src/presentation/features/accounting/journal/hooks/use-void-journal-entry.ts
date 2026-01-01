import { useCallback, useState } from 'react'
import { voidJournalEntryAction } from '@/core/actions/accounting/void-journal-entry.action'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { VoidJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/void-journal-entry.request'

interface UseVoidJournalEntryOptions {
  onCompleted?: (entry: JournalEntryDetail) => void
}

export const useVoidJournalEntry = (options?: UseVoidJournalEntryOptions) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const voidEntry = useCallback(
    async (id: string, payload: VoidJournalEntryRequest) => {
      setIsLoading(true)
      setError(null)
      const result = await voidJournalEntryAction(id, payload)
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
    voidEntry,
    isLoading,
    error,
  }
}
