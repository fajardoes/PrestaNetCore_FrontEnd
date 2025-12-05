import { useCallback, useState } from 'react'
import { createAgencyAction } from '@/core/actions/catalog/create-agency.action'
import { updateAgencyAction } from '@/core/actions/catalog/update-agency.action'
import type { AgencyPayload } from '@/core/api/catalog-api'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

interface SaveAgencyState {
  isSaving: boolean
  error: string | null
  lastSaved?: Agency
}

export const useSaveAgency = () => {
  const [state, setState] = useState<SaveAgencyState>({
    isSaving: false,
    error: null,
  })

  const createAgency = useCallback(async (payload: AgencyPayload) => {
    setState({ isSaving: true, error: null })
    const result = await createAgencyAction(payload)
    if (result.success) {
      setState({ isSaving: false, error: null, lastSaved: result.data })
      return { success: true, agency: result.data }
    }
    setState({ isSaving: false, error: result.error })
    return { success: false, error: result.error }
  }, [])

  const updateAgency = useCallback(
    async (agencyId: string, payload: AgencyPayload) => {
      setState({ isSaving: true, error: null })
      const result = await updateAgencyAction(agencyId, payload)
      if (result.success) {
        setState({ isSaving: false, error: null, lastSaved: result.data })
        return { success: true, agency: result.data }
      }
      setState({ isSaving: false, error: result.error })
      return { success: false, error: result.error }
    },
    [],
  )

  return {
    ...state,
    createAgency,
    updateAgency,
  }
}
