import { useCallback, useEffect, useMemo, useState } from 'react'
import { listUsersAction } from '@/core/actions/security/list-users.action'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const PAGE_SIZE = 10

interface UseUsersState {
  data: SecurityUser[]
  isLoading: boolean
  error: string | null
}

interface UseUsersOptions {
  enabled?: boolean
}

export const useUsers = (options?: UseUsersOptions) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseUsersState>({
    data: [],
    isLoading: false,
    error: null,
  })
  const [query, setQuery] = useState<{ search: string; status: StatusFilterValue }>({
    search: '',
    status: 'active',
  })
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listUsersAction()
    if (result.success) {
      setState({ data: result.data, isLoading: false, error: null })
    } else {
      setState({ data: [], isLoading: false, error: result.error })
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState({ data: [], isLoading: false, error: null })
      return
    }
    void fetchUsers()
  }, [enabled, fetchUsers])

  const filtered = useMemo(() => {
    const term = query.search.trim().toLowerCase()
    return state.data.filter((user) => {
      const matchesTerm =
        !term ||
        user.email.toLowerCase().includes(term) ||
        (user.phoneNumber?.toLowerCase() ?? '').includes(term)

      const isActive = !user.isDeleted
      const matchesStatus =
        query.status === 'all'
          ? true
          : query.status === 'active'
            ? isActive
            : !isActive

      return matchesTerm && matchesStatus
    })
  }, [query, state.data])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return {
    users: paginated,
    rawUsers: state.data,
    isLoading: state.isLoading,
    error: state.error,
    query,
    page,
    totalPages,
    setQuery,
    setPage,
    refresh: fetchUsers,
  }
}
