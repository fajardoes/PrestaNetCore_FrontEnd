import { useCallback, useEffect, useState } from 'react'
import {
  deactivateAnticipatedInstallmentSettingAction,
  listAnticipatedInstallmentLimitStrategiesAction,
  listAnticipatedInstallmentSettingsAction,
  listAnticipatedInstallmentStatusesAction,
  saveAnticipatedInstallmentSettingAction,
} from '@/core/actions/loans/anticipated-installment.action'
import type { UpsertAnticipatedInstallmentSettingsRequest } from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentCatalogItem,
  AnticipatedInstallmentSettingsResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'

export const useAnticipatedInstallmentSettings = (enabled: boolean) => {
  const [items, setItems] = useState<AnticipatedInstallmentSettingsResponse[]>([])
  const [strategies, setStrategies] = useState<AnticipatedInstallmentCatalogItem[]>([])
  const [statuses, setStatuses] = useState<AnticipatedInstallmentCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([])
      setStrategies([])
      setStatuses([])
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    const [settingsResult, strategiesResult, statusesResult] = await Promise.all([
      listAnticipatedInstallmentSettingsAction(),
      listAnticipatedInstallmentLimitStrategiesAction(),
      listAnticipatedInstallmentStatusesAction(),
    ])
    setIsLoading(false)
    if (!settingsResult.success) {
      setError(settingsResult.error)
      return
    }
    setItems(settingsResult.data)
    if (strategiesResult.success) setStrategies(strategiesResult.data)
    else setError(strategiesResult.error)
    if (statusesResult.success) setStatuses(statusesResult.data)
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = useCallback(async (
    id: string | null,
    payload: UpsertAnticipatedInstallmentSettingsRequest,
  ) => {
    setIsSaving(true)
    setError(null)
    const result = await saveAnticipatedInstallmentSettingAction(id, payload)
    setIsSaving(false)
    if (result.success) await refresh()
    else setError(result.error)
    return result
  }, [refresh])

  const deactivate = useCallback(async (id: string) => {
    setIsSaving(true)
    setError(null)
    const result = await deactivateAnticipatedInstallmentSettingAction(id)
    setIsSaving(false)
    if (result.success) await refresh()
    else setError(result.error)
    return result
  }, [refresh])

  return { items, strategies, statuses, isLoading, isSaving, error, refresh, save, deactivate }
}
