import { useCallback, useEffect, useMemo, useState } from 'react'
import { listHolidaysAction } from '@/core/actions/organization/list-holidays.action'
import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'

interface UseHolidaysState {
  items: HolidayListItemDto[]
  isLoading: boolean
  error: string | null
}

const sortHolidays = (items: HolidayListItemDto[]) =>
  [...items].sort((a, b) => a.date.localeCompare(b.date))

export const useHolidays = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseHolidaysState>({
    items: [],
    isLoading: false,
    error: null,
  })

  const fetchHolidays = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], isLoading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listHolidaysAction()
    if (result.success) {
      setState({
        items: sortHolidays(result.data),
        isLoading: false,
        error: null,
      })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchHolidays()
  }, [fetchHolidays])

  return useMemo(
    () => ({
      holidays: state.items,
      isLoading: state.isLoading,
      error: state.error,
      refresh: fetchHolidays,
    }),
    [state, fetchHolidays],
  )
}
