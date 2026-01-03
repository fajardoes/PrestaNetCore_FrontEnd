import * as yup from 'yup'

export const loanCatalogSchema = yup.object({
  code: yup
    .string()
    .trim()
    .max(50, 'El código no puede superar 50 caracteres.')
    .required('El código es requerido.'),
  name: yup
    .string()
    .trim()
    .max(150, 'El nombre no puede superar 150 caracteres.')
    .required('El nombre es requerido.'),
  description: yup.string().trim().nullable().optional(),
  sortOrder: yup
    .number()
    .typeError('El orden debe ser numérico.')
    .min(0, 'El orden debe ser mayor o igual a 0.')
    .nullable()
    .optional(),
  isActive: yup.boolean().required(),
})

export type LoanCatalogFormValues = yup.InferType<typeof loanCatalogSchema>
