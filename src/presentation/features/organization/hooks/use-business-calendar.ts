import { useCallback, useState } from 'react'
import { isBusinessDayAction } from '@/core/actions/organization/is-business-day.action'
import { adjustBusinessDateAction } from '@/core/actions/organization/adjust-business-date.action'
import type { IsBusinessDayResponseDto } from '@/infrastructure/interfaces/organization/holidays/is-business-day-response.dto'
import type { AdjustDateRequestDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-request.dto'
import type { AdjustDateResponseDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-response.dto'

export const useBusinessCalendar = () => {
  const [isChecking, setIsChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [checkResult, setCheckResult] = useState<IsBusinessDayResponseDto | null>(null)

  const [isAdjusting, setIsAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState<string | null>(null)
  const [adjustResult, setAdjustResult] = useState<AdjustDateResponseDto | null>(null)

  const validateBusinessDay = useCallback(async (params: {
    date: string
    agencyId?: string
    portfolioTypeId?: string
  }) => {
    setIsChecking(true)
    setCheckError(null)
    const result = await isBusinessDayAction(params)
    if (result.success) {
      setCheckResult(result.data)
      setIsChecking(false)
      return result
    }
    setCheckResult(null)
    setCheckError(result.error)
    setIsChecking(false)
    return result
  }, [])

  const adjustDate = useCallback(async (payload: AdjustDateRequestDto) => {
    setIsAdjusting(true)
    setAdjustError(null)
    const result = await adjustBusinessDateAction(payload)
    if (result.success) {
      setAdjustResult(result.data)
      setIsAdjusting(false)
      return result
    }
    setAdjustResult(null)
    setAdjustError(result.error)
    setIsAdjusting(false)
    return result
  }, [])

  const clearResults = () => {
    setCheckResult(null)
    setCheckError(null)
    setAdjustResult(null)
    setAdjustError(null)
  }

  return {
    isChecking,
    checkError,
    checkResult,
    isAdjusting,
    adjustError,
    adjustResult,
    validateBusinessDay,
    adjustDate,
    clearResults,
  }
}
