import * as yup from 'yup'

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
  insuranceTypeId: yup
    .string()
    .trim()
    .required('El tipo de seguro es requerido.'),
  calculationBaseId: yup
    .string()
    .trim()
    .required('La base de cálculo es requerida.'),
  coveragePeriodId: yup
    .string()
    .trim()
    .required('El período de cobertura es requerido.'),
  rate: yup
    .number()
    .typeError('La tasa del seguro es requerida.')
    .min(0, 'La tasa debe ser mayor o igual a 0.')
    .required('La tasa del seguro es requerida.'),
  chargeTimingId: yup
    .string()
    .trim()
    .required('El momento de cobro es requerido.'),
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
  termUnitId: yup
    .string()
    .trim()
    .required('La unidad de plazo es requerida.'),
  interestRateTypeId: yup
    .string()
    .trim()
    .required('El tipo de tasa es requerido.'),
  nominalRate: yup
    .number()
    .typeError('La tasa nominal es requerida.')
    .min(0, 'La tasa nominal debe ser mayor o igual a 0.')
    .required('La tasa nominal es requerida.'),
  rateBaseId: yup.string().trim().required('La base de tasa es requerida.'),
  amortizationMethodId: yup
    .string()
    .trim()
    .required('El método de amortización es requerido.'),
  paymentFrequencyId: yup
    .string()
    .trim()
    .required('La frecuencia de pago es requerida.'),
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
    .when('requiresCollateral', {
      is: true,
      then: (schema) =>
        schema
          .required('El ratio mínimo de garantía es requerido.')
          .moreThan(0, 'El ratio mínimo de garantía debe ser mayor a 0.'),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  hasInsurance: yup.boolean().required(),
  portfolioTypeId: yup
    .string()
    .trim()
    .required('El tipo de cartera es requerido.'),
  glLoanPortfolioAccountId: yup
    .string()
    .trim()
    .required('La cuenta de cartera es requerida.'),
  glInterestIncomeAccountId: yup
    .string()
    .trim()
    .required('La cuenta de ingresos por intereses es requerida.'),
  glInterestSuspenseAccountId: yup.string().trim().nullable().optional(),
  glFeeIncomeAccountId: yup.string().trim().nullable().optional(),
  glInsurancePayableAccountId: yup.string().trim().nullable().optional(),
  fees: yup.array().of(feeSchema).required(),
  insurances: yup.array().of(insuranceSchema).required(),
  collateralRules: yup.array().of(collateralRuleSchema).required(),
})

export type LoanProductFormValues = yup.InferType<typeof loanProductFormSchema>
