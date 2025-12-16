import { useCallback, useEffect, useState } from 'react'
import { getClientDetailAction } from '@/core/actions/clients/get-client-detail.action'
import type { ClientDetail } from '@/infrastructure/interfaces/clients/client'

interface ClientDetailState {
  client: ClientDetail | null
  isLoading: boolean
  error: string | null
}

export const useClientDetail = (clientId?: string | null) => {
  const [state, setState] = useState<ClientDetailState>({
    client: null,
    isLoading: false,
    error: null,
  })

  const fetchDetail = useCallback(
    async (id?: string | null) => {
      if (!id) {
        setState({ client: null, isLoading: false, error: null })
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await getClientDetailAction(id)
      if (result.success) {
        setState({ client: result.data, isLoading: false, error: null })
      } else {
        setState({ client: null, isLoading: false, error: result.error })
      }
    },
    [],
  )

  useEffect(() => {
    void fetchDetail(clientId)
  }, [clientId, fetchDetail])

  return {
    client: state.client,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchDetail,
    setClient: (client: ClientDetail | null) =>
      setState((prev) => ({ ...prev, client })),
  }
}
