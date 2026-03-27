import * as yup from 'yup'

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

const requiredCatalogId = (label: string) =>
  yup
    .string()
    .trim()
    .required(`${label} es requerido.`)
    .test(
      'not-empty-guid',
      `${label} es requerido.`,
      (value) => Boolean(value) && value !== EMPTY_GUID,
    )

export const feeSchema = yup.object({
  feeTypeId: yup.string().trim().required('El tipo de comisión es requerido.'),
  chargeBaseId: yup.string().trim().required('La base de cobro es requerida.'),
  valueTypeId: yup.string().trim().required('El tipo de valor es requerido.'),
  value: yup
    .number()
    .typeError('El valor de la comisión es requerido.')
    .min(0, 'El valor debe ser mayor o igual a 0.')
    .required('El valor de la comisión es requerido.'),
  chargeTimingId: yup
    .string()
    .trim()
    .required('El momento de cobro es requerido.'),
  isActive: yup.boolean().required(),
})

export const insuranceSchema = yup.object({
  id: yup.string().trim().nullable().optional(),
  insuranceTypeId: yup
    .string()
    .trim()
    .required('El tipo de seguro es requerido.'),
  insuranceTypeName: yup.string().trim().nullable().optional(),
  calculationBaseId: yup
    .string()
    .trim()
    .required('La base de cálculo es requerida.'),
  calculationBaseName: yup.string().trim().nullable().optional(),
  valueTypeId: yup
    .string()
    .trim()
    .required('El tipo de valor es requerido.'),
  valueTypeName: yup.string().trim().nullable().optional(),
  value: yup
    .number()
    .typeError('El valor del seguro es requerido.')
    .min(0, 'El valor debe ser mayor o igual a 0.')
    .required('El valor del seguro es requerido.'),
  chargeTimingId: yup
    .string()
    .trim()
    .required('El momento de cobro es requerido.'),
  chargeTimingName: yup.string().trim().nullable().optional(),
  isMandatory: yup.boolean().required(),
  isActive: yup.boolean().required(),
})

export const collateralRuleSchema = yup.object({
  collateralTypeId: yup
    .string()
    .trim()
    .required('El tipo de garantía es requerido.'),
  minCoverageRatio: yup
    .number()
    .typeError('El ratio mínimo de cobertura es requerido.')
    .moreThan(0, 'El ratio mínimo de cobertura debe ser mayor a 0.')
    .required('El ratio mínimo de cobertura es requerido.'),
  maxItems: yup
    .number()
    .typeError('El máximo de ítems debe ser numérico.')
    .min(0, 'El máximo de ítems debe ser mayor o igual a 0.')
    .nullable()
    .optional(),
  isActive: yup.boolean().required(),
})

export const loanProductFormSchema = yup.object({
  code: yup.string().trim().required('El código es requerido.'),
  name: yup.string().trim().required('El nombre es requerido.'),
  description: yup.string().trim().nullable().optional(),
  isActive: yup.boolean().required(),
  currencyCode: yup
    .string()
    .trim()
    .oneOf(['HNL'], 'La moneda debe ser HNL.')
    .required('La moneda es requerida.'),
  minAmount: yup
    .number()
    .typeError('El monto mínimo es requerido.')
    .min(0, 'El monto mínimo debe ser mayor o igual a 0.')
    .required('El monto mínimo es requerido.'),
  maxAmount: yup
    .number()
    .typeError('El monto máximo es requerido.')
    .min(0, 'El monto máximo debe ser mayor o igual a 0.')
    .required('El monto máximo es requerido.')
    .test(
      'max-amount',
      'El monto máximo debe ser mayor o igual al mínimo.',
      function (value) {
        const { minAmount } = this.parent
        if (typeof value !== 'number' || typeof minAmount !== 'number') {
          return true
        }
        return value >= minAmount
      },
    ),
  minTerm: yup
    .number()
    .typeError('El plazo mínimo es requerido.')
    .min(1, 'El plazo mínimo debe ser mayor o igual a 1.')
    .required('El plazo mínimo es requerido.'),
  maxTerm: yup
    .number()
    .typeError('El plazo máximo es requerido.')
    .min(1, 'El plazo máximo debe ser mayor o igual a 1.')
    .required('El plazo máximo es requerido.')
    .test(
      'max-term',
      'El plazo máximo debe ser mayor o igual al mínimo.',
      function (value) {
        const { minTerm } = this.parent
        if (typeof value !== 'number' || typeof minTerm !== 'number') {
          return true
        }
        return value >= minTerm
      },
    ),
  termUnitId: requiredCatalogId('La unidad de plazo'),
  interestRateTypeId: requiredCatalogId('El tipo de tasa'),
  nominalRate: yup
    .number()
    .typeError('La tasa nominal es requerida.')
    .min(0, 'La tasa nominal debe ser mayor o igual a 0.')
    .required('La tasa nominal es requerida.'),
  rateBaseId: requiredCatalogId('La base de tasa'),
  amortizationMethodId: requiredCatalogId('El método de amortización'),
  paymentFrequencyId: requiredCatalogId('La frecuencia de pago'),
  gracePrincipal: yup
    .number()
    .typeError('La gracia de capital es requerida.')
    .min(0, 'La gracia de capital debe ser mayor o igual a 0.')
    .required('La gracia de capital es requerida.'),
  graceInterest: yup
    .number()
    .typeError('La gracia de interés es requerida.')
    .min(0, 'La gracia de interés debe ser mayor o igual a 0.')
    .required('La gracia de interés es requerida.'),
  requiresCollateral: yup.boolean().required(),
  minCollateralRatio: yup
    .number()
    .typeError('El ratio mínimo de garantía es requerido.')
    .nullable()
    .when('requiresCollateral', {
      is: true,
      then: (schema) =>
        schema
          .required('El ratio mínimo de garantía es requerido.')
          .moreThan(0, 'El ratio mínimo de garantía debe ser mayor a 0.'),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  hasInsurance: yup.boolean().required(),
  portfolioTypeId: requiredCatalogId('El tipo de cartera'),
  dayRuleId: requiredCatalogId('La regla de días'),
  roundingModeId: requiredCatalogId('El modo de redondeo'),
  holidayAdjustmentRuleId: requiredCatalogId('La regla de ajuste por feriado'),
  glLoanPortfolioAccountId: yup
    .string()
    .trim()
    .required('La cuenta de cartera es requerida.'),
  glInterestIncomeAccountId: yup
    .string()
    .trim()
    .required('La cuenta de ingresos por intereses es requerida.'),
  glInterestReceivableAccountId: yup
    .string()
    .trim()
    .required('La cuenta de interés por cobrar es requerida.'),
  glInterestSuspenseAccountId: yup.string().trim().nullable().optional(),
  hasActiveDisbursementFees: yup.boolean().required(),
  hasActiveDisbursementInsurances: yup.boolean().required(),
  glFeeIncomeAccountId: yup
    .string()
    .trim()
    .nullable()
    .when('hasActiveDisbursementFees', {
      is: true,
      then: (schema) =>
        schema.required('La cuenta de ingresos por comisiones es requerida.'),
      otherwise: (schema) => schema.optional(),
    }),
  glDeferredFeeAccountId: yup
    .string()
    .trim()
    .nullable()
    .when('hasActiveDisbursementFees', {
      is: true,
      then: (schema) =>
        schema.required('La cuenta de comisión diferida es requerida.'),
      otherwise: (schema) => schema.optional(),
    }),
  glInsurancePayableAccountId: yup
    .string()
    .trim()
    .nullable()
    .when('hasActiveDisbursementInsurances', {
      is: true,
      then: (schema) =>
        schema.required('La cuenta de seguros por pagar es requerida.'),
      otherwise: (schema) => schema.optional(),
    }),
  fees: yup.array().of(feeSchema).required(),
  insurances: yup.array().of(insuranceSchema).required(),
  collateralRules: yup.array().of(collateralRuleSchema).required(),
})

export type LoanProductFormValues = yup.InferType<typeof loanProductFormSchema>
