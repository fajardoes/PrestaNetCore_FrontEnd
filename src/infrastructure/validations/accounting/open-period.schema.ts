import * as yup from 'yup'

export const openPeriodSchema = yup.object({
  fiscalYear: yup
    .number()
    .typeError('El año fiscal es obligatorio.')
    .required('El año fiscal es obligatorio.')
    .min(2000, 'El año debe ser mayor o igual a 2000.'),
  month: yup
    .number()
    .typeError('El mes es obligatorio.')
    .required('El mes es obligatorio.')
    .integer('El mes debe ser entero.')
    .min(1, 'Mes mínimo 1.')
    .max(12, 'Mes máximo 12.'),
  notes: yup.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
})

export type OpenPeriodFormValues = yup.InferType<typeof openPeriodSchema>
