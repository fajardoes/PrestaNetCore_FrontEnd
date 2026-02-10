import { useCallback, useRef, useState } from 'react'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'

interface EmployeeSearchState {
  results: ClientListItem[]
  isLoading: boolean
  error: string | null
}

const PAGE_SIZE = 10

export const useEmployeeClientsSearch = () => {
  const lastTermRef = useRef<string | null>(null)
  const [state, setState] = useState<EmployeeSearchState>({
    results: [],
    isLoading: false,
    error: null,
  })

  const searchEmployees = useCallback(async (term: string) => {
    const normalized = normalizeSearch(term)
    if (!normalized) {
      lastTermRef.current = null
      setState({ results: [], isLoading: false, error: null })
      return
    }
    if (lastTermRef.current === normalized) {
      return
    }
    lastTermRef.current = normalized

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listClientsAction({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      search: normalized,
      activo: true,
      esEmpleado: true,
    })

    if (result.success) {
      setState({ results: result.data.items ?? [], isLoading: false, error: null })
    } else {
      setState({ results: [], isLoading: false, error: result.error })
    }
  }, [])

  const clear = () => {
    lastTermRef.current = null
    setState({ results: [], isLoading: false, error: null })
  }

  return {
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    searchEmployees,
    clear,
  }
}

const normalizeSearch = (value?: string) => {
  if (!value) return undefined
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
