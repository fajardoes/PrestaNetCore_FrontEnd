export interface LoanApplicationCreditScoreHistoryItemResponse {
  id: string
  generatedAt: string
  generatedByUserId: string | null
  generatedBy: string
  scoreVersion: number
  engineVersion: string
  scoreValue: number
  riskLevelCode: string
  riskLevelName: string
  recommendationCode: string
  recommendationName: string
  isCurrent: boolean
}
