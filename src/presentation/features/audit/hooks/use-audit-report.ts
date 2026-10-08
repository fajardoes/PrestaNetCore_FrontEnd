import { useCallback, useEffect, useState } from 'react'
import { getAuditCatalogAction } from '@/core/actions/audit/get-audit-catalog.action'
import { searchAuditEntriesAction } from '@/core/actions/audit/search-audit-entries.action'
import type {
  AuditCatalog,
  AuditEntryPage,
  AuditSearchFilters,
} from '@/infrastructure/interfaces/audit/audit-entry'

interface AuditReportState {
  catalog: AuditCatalog | null
  entries: AuditEntryPage | null
  isCatalogLoading: boolean
  isLoading: boolean
  catalogError: string | null
  error: string | null
}

export const useAuditReport = () => {
  const [state, setState] = useState<AuditReportState>({
    catalog: null,
    entries: null,
    isCatalogLoading: true,
    isLoading: false,
    catalogError: null,
    error: null,
  })

  const loadCatalog = useCallback(async () => {
    setState((current) => ({ ...current, isCatalogLoading: true, catalogError: null }))
    const result = await getAuditCatalogAction()
    if (result.success) {
      setState((current) => ({
        ...current,
        catalog: result.data,
        isCatalogLoading: false,
        catalogError: null,
      }))
      return
    }
    setState((current) => ({ ...current, isCatalogLoading: false, catalogError: result.error }))
  }, [])

  const loadEntries = useCallback(async (filters: AuditSearchFilters) => {
    setState((current) => ({ ...current, isLoading: true, error: null }))
    const result = await searchAuditEntriesAction(filters)
    if (result.success) {
      setState((current) => ({
        ...current,
        entries: result.data,
        isLoading: false,
        error: null,
      }))
      return true
    }
    setState((current) => ({ ...current, entries: null, isLoading: false, error: result.error }))
    return false
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  return {
    catalog: state.catalog,
    entries: state.entries,
    isCatalogLoading: state.isCatalogLoading,
    isLoading: state.isLoading,
    catalogError: state.catalogError,
    error: state.error,
    loadCatalog,
    loadEntries,
  }
}
