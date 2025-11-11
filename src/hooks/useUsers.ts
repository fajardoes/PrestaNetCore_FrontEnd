import { useCallback, useEffect, useState } from 'react'
import { usersService } from '@/infrastructure/services/UsersService'
import type { User } from '@/types/user'
import { useAuth } from './useAuth'

interface UseUsersOptions {
  enabled?: boolean
}

interface UseUsersState {
  data: User[]
  isLoading: boolean
  error: string | null
}

const toErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return 'No fue posible obtener la lista de usuarios.'
}

export const useUsers = (options?: UseUsersOptions) => {
  const { isAuthenticated } = useAuth()
  const [{ data, isLoading, error }, setState] = useState<UseUsersState>({
    data: [],
    isLoading: false,
    error: null,
  })

  const enabled = options?.enabled ?? true

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const users = await usersService.list()
      setState({ data: users, isLoading: false, error: null })
    } catch (error_) {
      setState({
        data: [],
        isLoading: false,
        error: toErrorMessage(error_),
      })
    }
  }, [enabled, isAuthenticated])

  useEffect(() => {
    let isMounted = true
    if (!isAuthenticated || !enabled) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        data: [],
        error: null,
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    usersService
      .list()
      .then((users) => {
        if (!isMounted) return
        setState({ data: users, isLoading: false, error: null })
      })
      .catch((error_) => {
        if (!isMounted) return
        setState({
          data: [],
          isLoading: false,
          error: toErrorMessage(error_),
        })
      })

    return () => {
      isMounted = false
    }
  }, [enabled, isAuthenticated])

  return {
    data,
    isLoading,
    error,
    refetch: fetchUsers,
    canFetch: isAuthenticated && enabled,
  }
}
