import { useCallback, useEffect, useMemo, useState } from 'react'
import { listHolidayTypesAction } from '@/core/actions/organization/list-holiday-types.action'
import type { HolidayTypeItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-type-item.dto'

interface UseHolidayTypesState {
  items: HolidayTypeItemDto[]
  isLoading: boolean
  error: string | null
}

const sortHolidayTypes = (items: HolidayTypeItemDto[]) =>
  [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'))

export const useHolidayTypes = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseHolidayTypesState>({
    items: [],
    isLoading: false,
    error: null,
  })

  const fetchHolidayTypes = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listHolidayTypesAction()
    if (result.success) {
      setState({
        items: sortHolidayTypes(result.data),
        isLoading: false,
        error: null,
      })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchHolidayTypes()
  }, [fetchHolidayTypes])

  return useMemo(
    () => ({
      holidayTypes: state.items,
      isLoading: state.isLoading,
      error: state.error,
      refresh: fetchHolidayTypes,
    }),
    [state, fetchHolidayTypes],
  )
}
