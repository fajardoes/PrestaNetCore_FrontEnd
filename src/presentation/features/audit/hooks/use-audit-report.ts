import { useCallback, useEffect, useState } from 'react'
import { getAuditCatalogAction } from '@/core/actions/audit/get-audit-catalog.action'
import { exportAuditEntriesAction } from '@/core/actions/audit/export-audit-entries.action'
import { getAuditEntrySummaryAction } from '@/core/actions/audit/get-audit-entry-summary.action'
import { searchAuditEntriesAction } from '@/core/actions/audit/search-audit-entries.action'
import type {
  AuditCatalog,
  AuditEntryPage,
  AuditEntrySummary,
  AuditSearchFilters,
} from '@/infrastructure/interfaces/audit/audit-entry'

interface AuditReportState {
  catalog: AuditCatalog | null
  entries: AuditEntryPage | null
  summary: AuditEntrySummary | null
  isCatalogLoading: boolean
  isLoading: boolean
  catalogError: string | null
  error: string | null
  isSummaryLoading: boolean
  summaryError: string | null
  isExporting: boolean
  exportError: string | null
  exportMessage: string | null
}

export const useAuditReport = () => {
  const [state, setState] = useState<AuditReportState>({
    catalog: null,
    entries: null,
    summary: null,
    isCatalogLoading: true,
    isLoading: false,
    catalogError: null,
    error: null,
    isSummaryLoading: false,
    summaryError: null,
    isExporting: false,
    exportError: null,
    exportMessage: null,
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

  const loadSummary = useCallback(async (filters: AuditSearchFilters) => {
    setState((current) => ({ ...current, isSummaryLoading: true, summaryError: null }))
    const result = await getAuditEntrySummaryAction(filters)
    if (result.success) {
      setState((current) => ({
        ...current,
        summary: result.data,
        isSummaryLoading: false,
        summaryError: null,
      }))
      return true
    }
    setState((current) => ({ ...current, isSummaryLoading: false, summaryError: result.error }))
    return false
  }, [])

  const exportEntries = useCallback(async (filters: AuditSearchFilters) => {
    setState((current) => ({ ...current, isExporting: true, exportError: null, exportMessage: null }))
    const result = await exportAuditEntriesAction(filters)
    if (!result.success) {
      setState((current) => ({ ...current, isExporting: false, exportError: result.error, exportMessage: null }))
      return false
    }

    const url = URL.createObjectURL(result.data.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = result.data.fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    const watermarkUtc = result.data.watermarkUtc
      ? new Date(result.data.watermarkUtc).toISOString().replace('T', ' ').replace('Z', ' UTC')
      : null
    const rowCountMessage = result.data.rowCount === null
      ? 'El archivo CSV se descargó.'
      : `El archivo CSV se descargó con ${result.data.rowCount.toLocaleString('es-HN')} eventos.`
    setState((current) => ({
      ...current,
      isExporting: false,
      exportError: null,
      exportMessage: watermarkUtc
        ? `${rowCountMessage} Marca de corte: ${watermarkUtc}.`
        : rowCountMessage,
    }))
    return true
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  return {
    catalog: state.catalog,
    entries: state.entries,
    summary: state.summary,
    isCatalogLoading: state.isCatalogLoading,
    isLoading: state.isLoading,
    catalogError: state.catalogError,
    error: state.error,
    isSummaryLoading: state.isSummaryLoading,
    summaryError: state.summaryError,
    isExporting: state.isExporting,
    exportError: state.exportError,
    exportMessage: state.exportMessage,
    loadCatalog,
    loadEntries,
    loadSummary,
    exportEntries,
  }
}
