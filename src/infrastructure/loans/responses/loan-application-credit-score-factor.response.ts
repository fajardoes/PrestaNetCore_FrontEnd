export interface LoanApplicationCreditScoreFactorResponse {
  id: string
  factorCode: string
  factorName: string
  factorType: string
  weight: number | null
  valueText: string | null
  valueNumeric: number | null
  impactPoints: number | null
  description: string
}
