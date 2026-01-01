import { useCallback, useEffect, useState } from 'react'
import { listPeriodsAction } from '@/core/actions/accounting/list-periods.action'
import type {
  AccountingPeriodDto,
  AccountingPeriodState,
} from '@/infrastructure/interfaces/accounting/accounting-period'

const DEFAULT_PAGE_SIZE = 12

export type PeriodStateFilter = 'all' | AccountingPeriodState

interface UsePeriodsState {
  items: AccountingPeriodDto[]
  totalPages: number
  totalCount: number
  isLoading: boolean
  error: string | null
}

export const usePeriods = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UsePeriodsState>({
    items: [],
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    error: null,
  })
  const [openPeriod, setOpenPeriod] = useState<AccountingPeriodDto | null>(null)
  const [openPeriodLoading, setOpenPeriodLoading] = useState(false)
  const [openPeriodError, setOpenPeriodError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [year, setYear] = useState<number | null>(null)
  const [periodState, setPeriodState] = useState<PeriodStateFilter>('all')
  const pageSize = DEFAULT_PAGE_SIZE

  const fetchOpenPeriod = useCallback(async () => {
    if (!enabled) {
      setOpenPeriod(null)
      setOpenPeriodLoading(false)
      setOpenPeriodError(null)
      return
    }

    setOpenPeriodLoading(true)
    setOpenPeriodError(null)
    const result = await listPeriodsAction({
      page: 1,
      pageSize: 1,
      state: 'open',
    })

    if (result.success) {
      setOpenPeriod(result.data.items[0] ?? null)
      setOpenPeriodLoading(false)
      return
    }

    setOpenPeriod(null)
    setOpenPeriodError(result.error)
    setOpenPeriodLoading(false)
  }, [enabled])

  const fetchPeriods = useCallback(
    async (pageNumber: number) => {
      if (!enabled) {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: null,
        })
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listPeriodsAction({
        page: pageNumber,
        pageSize,
        year: year ?? undefined,
        state: periodState === 'all' ? undefined : periodState,
      })

      if (result.success) {
        const totalPages = Math.max(
          1,
          Math.ceil(result.data.totalCount / pageSize),
        )
        setState({
          items: result.data.items,
          totalPages,
          totalCount: result.data.totalCount,
          isLoading: false,
          error: null,
        })
        setPage((prevPage) => Math.min(prevPage, totalPages))
      } else {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: result.error,
        })
      }
    },
    [enabled, pageSize, year, periodState],
  )

  useEffect(() => {
    setPage(1)
  }, [year, periodState, pageSize])

  useEffect(() => {
    void fetchPeriods(page)
  }, [page, fetchPeriods])

  useEffect(() => {
    void fetchOpenPeriod()
  }, [fetchOpenPeriod])

  const getNextPeriodPreview = useCallback((period: AccountingPeriodDto | null) => {
    if (!period) return null
    if (period.month >= 12) {
      return { month: 1, fiscalYear: period.fiscalYear + 1 }
    }
    return { month: period.month + 1, fiscalYear: period.fiscalYear }
  }, [])

  return {
    periods: state.items,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    page,
    pageSize,
    isLoading: state.isLoading,
    error: state.error,
    openPeriod,
    openPeriodLoading,
    openPeriodError,
    getNextPeriodPreview,
    year,
    setYear,
    periodState,
    setPeriodState,
    setPage,
    refresh: async () => {
      await Promise.all([fetchPeriods(page), fetchOpenPeriod()])
    },
  }
}
