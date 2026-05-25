export type LoanApplicationFinancialAnalysisPeriodType = 'monthly'

export interface LoanApplicationFinancialProfileOtherLiabilityUpsertRequest {
  id?: string | null
  description: string
  amount: number
  sortOrder: number
}

export interface LoanApplicationFinancialProfileUpsertRequest {
  analysisPeriodType: LoanApplicationFinancialAnalysisPeriodType
  notes?: string | null
  analysisComments?: string | null
  cashAndBanks: number
  accountsReceivable: number
  inventoryValue: number
  housesAndLand: number
  vehicles: number
  householdGoods: number
  accountsPayableSuppliers: number
  loansPayable: number
  otherLiabilities: LoanApplicationFinancialProfileOtherLiabilityUpsertRequest[]
  businessIncome: number
  salaryIncome: number
  spouseChildrenIncome: number
  remittancesIncome: number
  otherIncome: number
  businessCostOfSales: number
  foodExpense: number
  healthEducationExpense: number
  utilitiesExpense: number
  loanInstallmentExpense: number
}
