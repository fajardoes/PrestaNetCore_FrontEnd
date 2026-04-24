import { useCallback, useState } from 'react'
import { listCollectionChannelsAction } from '@/core/actions/collection-channels/list-collection-channels.action'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import { getLoanByCodeAction } from '@/core/actions/loans/get-loan-by-code.action'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

const CHANNELS_PAGE_SIZE = 100
const CLIENTS_PAGE_SIZE = 20

export const usePaymentSupportData = () => {
  const [channels, setChannels] = useState<CollectionChannelResponse[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingLoan, setIsLoadingLoan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadChannels = useCallback(async () => {
    setIsLoadingChannels(true)
    setError(null)
    const result = await listCollectionChannelsAction({
      active: true,
      skip: 0,
      take: CHANNELS_PAGE_SIZE,
    })
    setIsLoadingChannels(false)

    if (!result.success) {
      setChannels([])
      setError(result.error)
      return []
    }

    setChannels(result.data.items)
    return result.data.items
  }, [])

  const searchClients = useCallback(async (term: string) => {
    setIsLoadingClients(true)
    setError(null)
    const result = await listClientsAction(
      {
        pageNumber: 1,
        pageSize: CLIENTS_PAGE_SIZE,
        search: term.trim() || undefined,
        activo: true,
      },
      { silent: true },
    )
    setIsLoadingClients(false)

    if (!result.success) {
      setError(result.error)
      return [] as ClientListItem[]
    }

    return result.data.items
  }, [])

  const findLoanByCode = useCallback(async (loanCode: string) => {
    setIsLoadingLoan(true)
    setError(null)
    const result = await getLoanByCodeAction(loanCode.trim())
    setIsLoadingLoan(false)

    if (!result.success) {
      setError(result.error)
      return null as LoanResponse | null
    }

    return result.data
  }, [])

  return {
    channels,
    isLoadingChannels,
    isLoadingClients,
    isLoadingLoan,
    error,
    setError,
    loadChannels,
    searchClients,
    findLoanByCode,
  }
}
