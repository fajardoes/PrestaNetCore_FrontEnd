import * as yup from 'yup'

export const closePeriodSchema = yup.object({
  notes: yup
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres.')
    .optional(),
})

export type ClosePeriodFormValues = yup.InferType<typeof closePeriodSchema>
