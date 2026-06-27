import { useCallback, useState } from 'react'
import { listCollectionChannelsAction } from '@/core/actions/collection-channels/list-collection-channels.action'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import { listBankEntitiesAction } from '@/core/actions/payments/list-bank-entities.action'
import { listUsersAction } from '@/core/actions/security/list-users.action'
import { getLoanByCodeAction } from '@/core/actions/loans/get-loan-by-code.action'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

const CHANNELS_PAGE_SIZE = 100
const CLIENTS_PAGE_SIZE = 20

export const usePaymentSupportData = () => {
  const [channels, setChannels] = useState<CollectionChannelResponse[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingLoan, setIsLoadingLoan] = useState(false)
  const [isLoadingBankEntities, setIsLoadingBankEntities] = useState(false)
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

  const searchUsers = useCallback(async (term: string) => {
    setIsLoadingUsers(true)
    setError(null)
    const result = await listUsersAction()
    setIsLoadingUsers(false)

    if (!result.success) {
      setError(result.error)
      return [] as SecurityUser[]
    }

    const normalized = term.trim().toLowerCase()
    return result.data
      .filter((user) => !user.isDeleted)
      .filter((user) => {
        if (!normalized) return true
        return (
          user.email.toLowerCase().includes(normalized) ||
          user.roles.some((role) => role.toLowerCase().includes(normalized))
        )
      })
      .slice(0, 20)
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

  const searchBankEntities = useCallback(async (term: string) => {
    setIsLoadingBankEntities(true)
    setError(null)
    const result = await listBankEntitiesAction({
      search: term.trim() || undefined,
      isActive: true,
    })
    setIsLoadingBankEntities(false)

    if (!result.success) {
      setError(result.error)
      return [] as BankEntityResponse[]
    }

    return result.data
  }, [])

  return {
    channels,
    isLoadingChannels,
    isLoadingClients,
    isLoadingUsers,
    isLoadingLoan,
    isLoadingBankEntities,
    error,
    setError,
    loadChannels,
    searchClients,
    searchUsers,
    searchBankEntities,
    findLoanByCode,
  }
}
