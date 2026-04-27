import { useCallback, useState } from 'react'
import { lookupPaymentsAction } from '@/core/actions/payments/lookup-payments.action'
import { SearchLoanClientsAction } from '@/core/actions/loans/search-loan-clients.action'
import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import type { PaymentLookupResponse } from '@/infrastructure/payments/responses/payment-lookup-response'

const DEFAULT_CLIENTS_PAGE_SIZE = 10

export const usePaymentLookup = () => {
  const [lookup, setLookup] = useState<PaymentLookupResponse | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const [clientSearchResults, setClientSearchResults] = useState<LoanClientSearchItemResponse[]>([])
  const [clientSearchTotalPages, setClientSearchTotalPages] = useState(1)
  const [clientSearchLoading, setClientSearchLoading] = useState(false)
  const [clientSearchError, setClientSearchError] = useState<string | null>(null)

  const lookupByLoanNo = useCallback(async (loanNo: string) => {
    setIsLookingUp(true)
    setLookupError(null)

    const result = await lookupPaymentsAction({ loanNo: loanNo.trim() })
    setIsLookingUp(false)

    if (!result.success) {
      setLookup(null)
      setLookupError(result.error)
      return result
    }

    setLookup(result.data)
    return result
  }, [])

  const lookupByClientIdentity = useCallback(async (clientIdentityNo: string) => {
    setIsLookingUp(true)
    setLookupError(null)

    const result = await lookupPaymentsAction({ clientIdentityNo: clientIdentityNo.trim() })
    setIsLookingUp(false)

    if (!result.success) {
      setLookup(null)
      setLookupError(result.error)
      return result
    }

    setLookup(result.data)
    return result
  }, [])

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

  const clearLookup = useCallback(() => {
    setLookup(null)
    setLookupError(null)
  }, [])

  return {
    lookup,
    isLookingUp,
    lookupError,
    clientSearchResults,
    clientSearchTotalPages,
    clientSearchLoading,
    clientSearchError,
    lookupByLoanNo,
    lookupByClientIdentity,
    searchClients,
    clearLookup,
  }
}
