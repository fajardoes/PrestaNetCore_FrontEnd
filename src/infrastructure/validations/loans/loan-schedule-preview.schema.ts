import * as yup from 'yup'

const optionalNumber = yup
  .number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return undefined
    }
    return Number.isNaN(value) ? undefined : value
  })

export const loanSchedulePreviewSchema = yup.object({
  principalOverride: optionalNumber
    .nullable()
    .moreThan(0, 'El principal debe ser mayor a 0.')
    .optional(),
  termOverride: optionalNumber
    .nullable()
    .integer('El plazo debe ser entero.')
    .moreThan(0, 'El plazo debe ser mayor a 0.')
    .optional(),
  paymentFrequencyIdOverride: yup.string().trim().nullable().optional(),
  nominalRateOverride: optionalNumber
    .nullable()
    .min(0, 'La tasa no puede ser negativa.')
    .optional(),
  firstDueDateOverride: yup.string().trim().nullable().optional(),
})

export type LoanSchedulePreviewFormValues = yup.InferType<
  typeof loanSchedulePreviewSchema
>
