import { useCallback, useState } from 'react'
import { getJournalEntryAction } from '@/core/actions/accounting/get-journal-entry.action'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'

export const useJournalEntryDetail = () => {
  const [entry, setEntry] = useState<JournalEntryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEntry = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    const result = await getJournalEntryAction(id)
    if (result.success) {
      setEntry(result.data)
      setIsLoading(false)
      return { success: true, data: result.data }
    }
    setEntry(null)
    setError(result.error)
    setIsLoading(false)
    return { success: false, error: result.error }
  }, [])

  const clear = useCallback(() => {
    setEntry(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    entry,
    isLoading,
    error,
    loadEntry,
    clear,
  }
}
