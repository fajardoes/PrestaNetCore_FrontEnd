import type { LoanApplicationCreditScoreFactorResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-factor.response'
import type { LoanApplicationCreditScoreMetricResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-metric.response'

export interface LoanApplicationCreditScoreResponse {
  id: string
  loanApplicationId: string
  scoreVersion: number
  engineVersion: string
  scoreValue: number
  riskLevelCode: string
  riskLevelName: string
  riskLevelDisplayName: string
  colorHex: string
  colorHexDark: string
  uiVariant: string
  recommendationCode: string
  recommendationName: string
  recommendationDisplayName: string
  decisionSummary: string
  financialScore: number | null
  capacityScore: number | null
  collateralScore: number | null
  behaviorScore: number | null
  productFitScore: number | null
  isCurrent: boolean
  generatedAt: string
  generatedByUserId: string | null
  generatedBy: string
  businessDate: string
  positiveFactors: LoanApplicationCreditScoreFactorResponse[]
  negativeFactors: LoanApplicationCreditScoreFactorResponse[]
  infoFactors: LoanApplicationCreditScoreFactorResponse[]
  metrics: LoanApplicationCreditScoreMetricResponse[]
}
