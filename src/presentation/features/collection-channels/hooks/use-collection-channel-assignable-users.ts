import { useCallback, useEffect, useState } from 'react'
import { listEligibleCollectionChannelUsersAction } from '@/core/actions/collection-channels/list-eligible-collection-channel-users.action'
import type { EligibleCollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/eligible-collection-channel-user-response'

interface AssignableUsersState {
  users: EligibleCollectionChannelUserResponse[]
  isLoading: boolean
  error: string | null
}

const DEFAULT_QUERY = {
  search: undefined,
  excludeAssigned: true,
} as const

export const useCollectionChannelAssignableUsers = (enabled = true) => {
  const [state, setState] = useState<AssignableUsersState>({
    users: [],
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (search?: string) => {
      if (!enabled) {
        setState({ users: [], isLoading: false, error: null })
        return []
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const normalizedSearch = search?.trim() || undefined
      const result = await listEligibleCollectionChannelUsersAction({
        ...DEFAULT_QUERY,
        search: normalizedSearch,
      })

      if (result.success) {
        setState((prev) => ({
          users: normalizedSearch ? prev.users : result.data,
          isLoading: false,
          error: null,
        }))
        return result.data
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error,
        ...(normalizedSearch ? {} : { users: [] }),
      }))
      return []
    },
    [enabled],
  )

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    refresh: () => load(),
    searchUsers: load,
  }
}
