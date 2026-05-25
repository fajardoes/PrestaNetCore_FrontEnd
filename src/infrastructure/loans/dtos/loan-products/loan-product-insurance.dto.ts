export interface LoanProductInsuranceDto {
  id?: string | null
  insuranceTypeId: string
  insuranceTypeName?: string | null
  calculationBaseId: string
  calculationBaseName?: string | null
  calculationBaseCode?: string | null
  valueTypeId: string
  valueTypeName?: string | null
  valueTypeCode?: string | null
  value: number
  chargeTimingId: string
  chargeTimingName?: string | null
  chargeTimingCode?: string | null
  isMandatory: boolean
  isActive: boolean
}
