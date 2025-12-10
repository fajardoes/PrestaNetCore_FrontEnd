import { useCallback, useState } from 'react'
import { saveMunicipalityAction } from '@/core/actions/geography/save-municipality.action'
import type { MunicipalityPayload } from '@/core/api/geography-api'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'

interface SaveMunicipalityState {
  isSaving: boolean
  error: string | null
  lastSaved?: Municipality
}

export const useSaveMunicipality = () => {
  const [state, setState] = useState<SaveMunicipalityState>({
    isSaving: false,
    error: null,
  })

  const saveMunicipality = useCallback(
    async (payload: MunicipalityPayload, municipalityId?: string) => {
      setState({ isSaving: true, error: null })
      const result = await saveMunicipalityAction(payload, municipalityId)
      if (result.success) {
        setState({
          isSaving: false,
          error: null,
          lastSaved: result.data,
        })
        return { success: true, municipality: result.data }
      }
      setState({ isSaving: false, error: result.error })
      return { success: false, error: result.error }
    },
    [],
  )

  return {
    ...state,
    saveMunicipality,
  }
}
