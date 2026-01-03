import type { LoanProductFeeDto } from './loan-product-fee.dto'
import type { LoanProductInsuranceDto } from './loan-product-insurance.dto'
import type { LoanProductCollateralRuleDto } from './loan-product-collateral-rule.dto'

export interface LoanProductUpdateDto {
  code: string
  name: string
  description?: string | null
  isActive: boolean
  currencyCode: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  termUnitId: string
  interestRateTypeId: string
  nominalRate: number
  rateBaseId: string
  amortizationMethodId: string
  paymentFrequencyId: string
  gracePrincipal: number
  graceInterest: number
  requiresCollateral: boolean
  minCollateralRatio?: number | null
  hasInsurance: boolean
  portfolioTypeId: string
  glLoanPortfolioAccountId: string
  glInterestIncomeAccountId: string
  glInterestSuspenseAccountId?: string | null
  glFeeIncomeAccountId?: string | null
  glInsurancePayableAccountId?: string | null
  fees: LoanProductFeeDto[]
  insurances: LoanProductInsuranceDto[]
  collateralRules: LoanProductCollateralRuleDto[]
}
