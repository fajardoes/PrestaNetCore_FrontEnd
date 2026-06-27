export interface LoanApplicationReportResponse {
  application: LoanApplicationReportApplication
  client: LoanApplicationReportClient
  loanProduct: LoanApplicationReportLoanProduct
  promoter: LoanApplicationReportPromoter
  clientActivities: LoanApplicationReportClientActivity[]
  collaterals: LoanApplicationReportCollateral[]
  financialProfile: LoanApplicationReportFinancialProfile | null
}

export interface LoanApplicationReportApplication {
  id: string
  applicationNo: string
  clientId: string
  clientFullName: string
  clientIdentityNo: string
  loanProductId: string
  loanProductCode: string
  loanProductName: string
  promoterId: string
  promoterCode?: string | null
  promoterClientFullName: string
  statusId: string
  statusCode: string
  statusName: string
  requestedPrincipal: number
  requestedTerm: number
  requestedPaymentFrequencyId: string
  requestedPaymentFrequencyCode: string
  requestedPaymentFrequencyName: string
  suggestedPaymentFrequencyId?: string | null
  suggestedPaymentFrequencyCode?: string | null
  suggestedPaymentFrequencyName?: string | null
  requestedRateOverride?: number | null
  notes?: string | null
  createdOperationalDate: string
  submittedOperationalDate?: string | null
  approvedOperationalDate?: string | null
  disbursedOperationalDate?: string | null
  rejectedOperationalDate?: string | null
  cancelledOperationalDate?: string | null
  returnedToDraftOperationalDate?: string | null
  rejectedReason?: string | null
  cancelledReason?: string | null
  returnedToDraftReason?: string | null
  approvedLoanId?: string | null
  hasFinancialProfile: boolean
  isFinancialProfileComplete: boolean
  financialProfileUpdatedAt?: string | null
  financialDebtRatio: number
  financialDebtToEquityRatio: number
  createdAt: string
}

export interface LoanApplicationReportClient {
  id: string
  fullName: string
  identityNo: string
  rtn?: string | null
  address: string
  phone?: string | null
  birthDate: string
  genderName: string
  maritalStatusName: string
  professionName: string
  municipalityName: string
  departmentName: string
  isEmployee: boolean
  timeLivingMonths: number
  dependentsName: string
  housingTypeName: string
}

export interface LoanApplicationReportLoanProduct {
  id: string
  code: string
  name: string
  description?: string | null
  currencyCode: string
  nominalRate: number
  interestRateTypeName: string
  rateBaseName: string
  amortizationMethodName: string
  defaultPaymentFrequencyName: string
  termUnitName: string
  minTerm: number
  maxTerm: number
  minAmount: number
  maxAmount: number
  requiresCollateral: boolean
  minCollateralRatio: number
  gracePrincipal: number
  graceInterest: number
  portfolioTypeName: string
}

export interface LoanApplicationReportPromoter {
  id: string
  code?: string | null
  clientId: string
  fullName: string
  identityNo: string
  agencyId: string
  agencyName: string
  agencyCode: string
}

export interface LoanApplicationReportClientActivity {
  id: string
  activityId: string
  activityName: string
  sectorName?: string | null
  companyName?: string | null
  description?: string | null
  phone?: string | null
  monthlyIncome: number
  monthlyExpense: number
  activityLocation?: string | null
  timeActivityMonths: number
  isPrimary: boolean
  isBusiness: boolean
  isActive: boolean
}

export interface LoanApplicationReportCollateral {
  linkId: string
  collateralId: string
  referenceNo?: string | null
  description?: string | null
  collateralTypeName: string
  collateralStatusName: string
  appraisedValue: number
  appraisedDate?: string | null
  coverageValue: number
  notes?: string | null
  ownerClientId: string
  ownerClientFullName: string
  guarantorClientId?: string | null
  guarantorClientFullName?: string | null
  guarantorClientIdentityNo?: string | null
}

export interface LoanApplicationReportOtherLiability {
  id: string
  description: string
  amount: number
  sortOrder: number
}

export interface LoanApplicationReportFinancialProfile {
  id: string
  loanApplicationId: string
  analysisPeriodType: string
  notes?: string | null
  analysisComments?: string | null
  isComplete: boolean
  cashAndBanks: number
  accountsReceivable: number
  inventoryValue: number
  housesAndLand: number
  vehicles: number
  householdGoods: number
  accountsPayableSuppliers: number
  loansPayable: number
  otherLiabilities: LoanApplicationReportOtherLiability[]
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
  totalAssets: number
  totalOtherLiabilities: number
  totalLiabilities: number
  equity: number
  totalLiabilitiesEquity: number
  totalIncome: number
  totalExpenses: number
  periodProfit: number
  debtRatio: number
  debtToEquityRatio: number
  createdAt: string
  updatedAt?: string | null
}
