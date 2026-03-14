import { useCallback, useEffect, useMemo, useState } from 'react'
import { ListLoansAction } from '@/core/actions/loans/list-loans.action'
import { SearchLoanClientsAction } from '@/core/actions/loans/search-loan-clients.action'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { LoanListItemResponse, LoanListSummaryResponse } from '@/infrastructure/loans/responses/loan-list-response'

const DEFAULT_CLIENTS_PAGE_SIZE = 10
const DEFAULT_LOANS_PAGE_SIZE = 20

export interface ClientLoansExplorerNavigationState {
  selectedClient: LoanClientSearchItemResponse | null
  loansPage: number
  loansPageSize: number
}

export const useClientLoansExplorer = (
  initialState?: ClientLoansExplorerNavigationState | null,
) => {
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientSearchPage, setClientSearchPage] = useState(1)
  const [clientSearchResults, setClientSearchResults] = useState<LoanClientSearchItemResponse[]>([])
  const [clientSearchTotalPages, setClientSearchTotalPages] = useState(1)
  const [clientSearchLoading, setClientSearchLoading] = useState(false)
  const [clientSearchError, setClientSearchError] = useState<string | null>(null)

  const [selectedClient, setSelectedClient] = useState<LoanClientSearchItemResponse | null>(
    initialState?.selectedClient ?? null,
  )
  const [loans, setLoans] = useState<LoanListItemResponse[]>([])
  const [summary, setSummary] = useState<LoanListSummaryResponse | null>(null)
  const [loansPage, setLoansPage] = useState(initialState?.loansPage ?? 1)
  const [loansPageSize, setLoansPageSize] = useState(
    initialState?.loansPageSize ?? DEFAULT_LOANS_PAGE_SIZE,
  )
  const [loansTotalPages, setLoansTotalPages] = useState(1)
  const [loansLoading, setLoansLoading] = useState(false)
  const [loansError, setLoansError] = useState<string | null>(null)

  const searchClients = useCallback(async (term: string, page = 1) => {
    setClientSearchLoading(true)
    setClientSearchError(null)

    const result = await new SearchLoanClientsAction().execute({
      term: term.trim() || undefined,
      page,
      pageSize: DEFAULT_CLIENTS_PAGE_SIZE,
    })

    setClientSearchLoading(false)

    if (!result.success) {
      setClientSearchResults([])
      setClientSearchTotalPages(1)
      setClientSearchError(result.error)
      return
    }

    setClientSearchResults(result.data.items)
    setClientSearchTotalPages(Math.max(1, result.data.totalPages))
  }, [])

  const loadLoans = useCallback(async (clientId: string, page: number, pageSize: number) => {
    setLoansLoading(true)
    setLoansError(null)

    const result = await new ListLoansAction().execute({
      clientId,
      page,
      pageSize,
    })

    setLoansLoading(false)

    if (!result.success) {
      setLoans([])
      setSummary(null)
      setLoansTotalPages(1)
      setLoansError(result.error)
      return
    }

    setLoans(result.data.items)
    setSummary(result.data.summary ?? null)
    setLoansTotalPages(Math.max(1, result.data.totalPages))
  }, [])

  useEffect(() => {
    if (!clientPickerOpen) return
    void searchClients(clientSearch, clientSearchPage)
  }, [clientPickerOpen, clientSearch, clientSearchPage, searchClients])

  useEffect(() => {
    if (!selectedClient) return
    void loadLoans(selectedClient.id, loansPage, loansPageSize)
  }, [selectedClient, loansPage, loansPageSize, loadLoans])

  const navigationState = useMemo(
    () =>
      ({
        selectedClient,
        loansPage,
        loansPageSize,
      }) satisfies ClientLoansExplorerNavigationState,
    [selectedClient, loansPage, loansPageSize],
  )

  return {
    clientPickerOpen,
    openClientPicker: () => setClientPickerOpen(true),
    closeClientPicker: () => setClientPickerOpen(false),
    clientSearch,
    setClientSearch: (value: string) => {
      setClientSearch(value)
      setClientSearchPage(1)
    },
    clientSearchPage,
    setClientSearchPage,
    clientSearchResults,
    clientSearchTotalPages,
    clientSearchLoading,
    clientSearchError,
    selectedClient,
    selectClient: (client: LoanClientSearchItemResponse) => {
      setSelectedClient(client)
      setLoansPage(1)
      setClientPickerOpen(false)
    },
    clearSelectedClient: () => {
      setSelectedClient(null)
      setLoans([])
      setSummary(null)
      setLoansError(null)
      setLoansPage(1)
      setLoansPageSize(DEFAULT_LOANS_PAGE_SIZE)
    },
    loans,
    summary,
    loansPage,
    setLoansPage,
    loansPageSize,
    setLoansPageSize: (value: number) => {
      setLoansPageSize(value)
      setLoansPage(1)
    },
    loansTotalPages,
    loansLoading,
    loansError,
    navigationState,
  }
}
