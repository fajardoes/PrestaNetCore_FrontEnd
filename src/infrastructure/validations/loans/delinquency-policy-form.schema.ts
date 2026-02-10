import * as yup from 'yup'

export const delinquencyBucketSchema = yup.object({
  id: yup.string().nullable().optional(),
  code: yup.string().trim().required('El código del bucket es requerido.'),
  name: yup.string().trim().required('El nombre del bucket es requerido.'),
  fromDays: yup
    .number()
    .typeError('Los días desde son requeridos.')
    .min(0, 'Los días desde deben ser mayor o igual a 0.')
    .required('Los días desde son requeridos.'),
  toDays: yup
    .number()
    .typeError('Los días hasta son requeridos.')
    .min(0, 'Los días hasta deben ser mayor o igual a 0.')
    .required('Los días hasta son requeridos.')
    .test(
      'from-to',
      'Los días hasta deben ser mayor o igual a los días desde.',
      function (value) {
        const { fromDays } = this.parent
        if (typeof value !== 'number' || typeof fromDays !== 'number') {
          return true
        }
        return value >= fromDays
      },
    ),
  sortOrder: yup
    .number()
    .typeError('El orden es requerido.')
    .min(0, 'El orden debe ser mayor o igual a 0.')
    .required('El orden es requerido.'),
  isActive: yup.boolean().required(),
})

export const delinquencyPolicyFormSchema = yup
  .object({
    code: yup.string().trim().required('El código es requerido.'),
    name: yup.string().trim().required('El nombre es requerido.'),
    description: yup.string().trim().nullable().optional(),
    graceDays: yup
      .number()
      .typeError('Los días de gracia son requeridos.')
      .min(0, 'Los días de gracia deben ser mayor o igual a 0.')
      .required('Los días de gracia son requeridos.'),
    penaltyRateAnnual: yup
      .number()
      .typeError('La tasa anual es requerida.')
      .min(0, 'La tasa anual debe ser mayor o igual a 0.')
      .required('La tasa anual es requerida.'),
    rateBase: yup
      .number()
      .oneOf([360, 365], 'La base debe ser 360 o 365.')
      .required('La base de tasa es requerida.'),
    calculationBase: yup
      .string()
      .trim()
      .required('La base de cálculo es requerida.'),
    roundingMode: yup
      .string()
      .trim()
      .required('El modo de redondeo es requerido.'),
    roundingDecimals: yup
      .number()
      .typeError('Los decimales son requeridos.')
      .min(0, 'Los decimales deben ser mayor o igual a 0.')
      .required('Los decimales son requeridos.'),
    minimumPenaltyAmount: yup
      .number()
      .typeError('El monto mínimo es requerido.')
      .min(0, 'El monto mínimo debe ser mayor o igual a 0.')
      .required('El monto mínimo es requerido.'),
    maximumPenaltyAmount: yup
      .number()
      .typeError('El monto máximo debe ser numérico.')
      .min(0, 'El monto máximo debe ser mayor o igual a 0.')
      .nullable()
      .optional()
      .test(
        'max-amount',
        'El monto máximo debe ser mayor o igual al mínimo.',
        function (value) {
          const { minimumPenaltyAmount } = this.parent
          if (typeof value !== 'number' || typeof minimumPenaltyAmount !== 'number') {
            return true
          }
          return value >= minimumPenaltyAmount
        },
      ),
    includeSaturday: yup.boolean().required(),
    includeSunday: yup.boolean().required(),
    buckets: yup
      .array()
      .of(delinquencyBucketSchema)
      .test(
        'no-overlap',
        'Los buckets no deben solaparse.',
        (value) => {
          if (!value || value.length < 2) return true
          const ranges = value
            .map((bucket) => ({
              fromDays: bucket.fromDays,
              toDays: bucket.toDays,
            }))
            .filter(
              (bucket) =>
                typeof bucket.fromDays === 'number' &&
                typeof bucket.toDays === 'number',
            )
            .sort((a, b) => a.fromDays - b.fromDays)

          for (let i = 1; i < ranges.length; i += 1) {
            if (ranges[i].fromDays <= ranges[i - 1].toDays) {
              return false
            }
          }
          return true
        },
      )
      .required(),
  })
  .required()

export type DelinquencyPolicyFormValues = yup.InferType<
  typeof delinquencyPolicyFormSchema
>
