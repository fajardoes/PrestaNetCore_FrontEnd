import type { LoanApplicationFinancialAnalysisPeriodType } from '@/infrastructure/loans/requests/loan-application-financial-profile-upsert-request'

export interface LoanApplicationFinancialProfileOtherLiabilityResponse {
  id?: string | null
  description: string
  amount: number
  sortOrder: number
}

export interface LoanApplicationFinancialProfileResponse {
  id: string
  loanApplicationId: string
  analysisPeriodType: LoanApplicationFinancialAnalysisPeriodType
  notes?: string | null
  analysisComments?: string | null
  cashAndBanks: number
  accountsReceivable: number
  inventoryValue: number
  housesAndLand: number
  vehicles: number
  householdGoods: number
  totalAssets?: number | null
  accountsPayableSuppliers: number
  loansPayable: number
  otherLiabilities: LoanApplicationFinancialProfileOtherLiabilityResponse[]
  totalOtherLiabilities?: number | null
  totalLiabilities?: number | null
  equity?: number | null
  totalLiabilitiesEquity?: number | null
  businessIncome: number
  salaryIncome: number
  spouseChildrenIncome: number
  remittancesIncome: number
  otherIncome: number
  totalIncome?: number | null
  businessCostOfSales: number
  foodExpense: number
  healthEducationExpense: number
  utilitiesExpense: number
  loanInstallmentExpense: number
  totalExpenses?: number | null
  periodProfit?: number | null
  debtRatio?: number | null
  debtToEquityRatio?: number | null
  isComplete: boolean
  createdAt?: string | null
  updatedAt?: string | null
}
