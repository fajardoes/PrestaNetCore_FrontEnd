import { useCallback, useState } from 'react'
import { GenerateLoanApplicationScoringAction } from '@/core/actions/loan-applications/generate-loan-application-scoring.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

const mapGenerateError = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 403) return 'No autorizado para generar scoring crediticio.'
  if (result.status === 409) return result.error
  if (result.status === 422) return result.error
  return result.error
}

export const useGenerateLoanApplicationScoring = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (id: string): Promise<ApiResult<LoanApplicationCreditScoreResponse>> => {
      setIsGenerating(true)
      setError(null)
      const result = await new GenerateLoanApplicationScoringAction().execute(id)
      setIsGenerating(false)
      setError(result.success ? null : mapGenerateError(result))
      return result
    },
    [],
  )

  return {
    isGenerating,
    error,
    generate,
  }
}
