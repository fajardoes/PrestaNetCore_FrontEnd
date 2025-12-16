import { useState } from 'react'
import { saveClientAction } from '@/core/actions/clients/save-client.action'
import type { ClientCreatePayload, ClientDetail } from '@/infrastructure/interfaces/clients/client'

interface UseSaveClientState {
  isSaving: boolean
  error: string | null
}

export const useSaveClient = () => {
  const [state, setState] = useState<UseSaveClientState>({
    isSaving: false,
    error: null,
  })

  const saveClient = async (payload: ClientCreatePayload, clientId?: string) => {
    setState({ isSaving: true, error: null })
    const result = await saveClientAction({ clientId, payload })
    if (result.success) {
      setState({ isSaving: false, error: null })
      return result
    }
    setState({ isSaving: false, error: result.error })
    return result
  }

  const resetError = () => setState((prev) => ({ ...prev, error: null }))

  return {
    saveClient,
    isSaving: state.isSaving,
    error: state.error,
    resetError,
  }
}
