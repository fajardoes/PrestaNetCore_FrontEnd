import { useCallback, useState } from 'react'
import { GetLoanApplicationReportAction } from '@/core/actions/loan-applications/get-loan-application-report.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationReportResponse } from '@/infrastructure/loans/responses/loan-application-report-response'

interface LoanApplicationReportState {
  report: LoanApplicationReportResponse | null
  isLoading: boolean
  error: string | null
}

export const useLoanApplicationReport = () => {
  const [state, setState] = useState<LoanApplicationReportState>({
    report: null,
    isLoading: false,
    error: null,
  })

  const loadReport = useCallback(
    async (id: string): Promise<ApiResult<LoanApplicationReportResponse>> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await new GetLoanApplicationReportAction().execute(id)
      setState({
        report: result.success ? result.data : null,
        isLoading: false,
        error: result.success ? null : result.error,
      })
      return result
    },
    [],
  )

  const clearReport = useCallback(() => {
    setState({ report: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    loadReport,
    clearReport,
  }
}
